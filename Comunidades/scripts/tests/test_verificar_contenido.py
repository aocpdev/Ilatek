"""Contrato de `verificar-contenido.py`.

Lo que estos tests fijan es que la pieza discrimina: un embed de la hermana, un
payload alterado, texto de otra comunidad pegado o una og repetida salen como
fallo, y un filtro vacío no puede leerse como aprobado.

    python scripts/tests/test_verificar_contenido.py       # desde Comunidades/
"""

import importlib.util
import pathlib
import unittest

RAIZ = pathlib.Path(__file__).resolve().parents[2]          # .../Comunidades
_spec = importlib.util.spec_from_file_location("verificar_contenido", RAIZ / "scripts" / "verificar-contenido.py")
vc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(vc)

TECHOS = (
    "<h1>Sellado de techo en Isla Verde, Carolina</h1>"
    "<p>Protegemos la losa de tu comunidad antes de la temporada de lluvias con membrana "
    "elastomérica aplicada por cuadrilla propia y con garantía escrita.</p>"
    "<p>Coordinamos la inspección del techo y la limpieza de canaletas en una sola visita "
    "para no repetir la movilización de equipos en tu comunidad.</p>"
)
LIMPIEZA = (
    "<h1>Servicio de limpieza en Isla Verde, Carolina</h1>"
    "<p>Limpieza profunda de áreas comunes, escaleras y pasillos con productos que no "
    "dañan las superficies ni los acabados de tu comunidad.</p>"
    "<p>El equipo llega con su propio material y deja registro fotográfico del antes y el "
    "después de cada área intervenida durante la jornada.</p>"
)
VECINA = (
    "<h1>Sellado de techo en Riviera, Bayamón</h1>"
    "<p>Subimos a inspeccionar la azotea de tu urbanización con dron y entregamos un "
    "informe con fotos de cada punto crítico detectado en el techo.</p>"
)


def pagina(html: str, og: str = "og-1.png") -> str:
    return ('<!doctype html><html><head><title>Isla Verde</title>'
            f'<meta property="og:image" content="https://cdn/{og}"></head>'
            f"<body>{html}</body></html>")


class RevisarPaginaTest(unittest.TestCase):
    def revisar(self, vivo, propio=TECHOS, hermano=LIMPIEZA, vecinas=()):
        return vc.revisar_pagina(propio, hermano, list(vecinas), vivo)

    def assertFalla(self, fallos, fragmento):
        self.assertTrue(any(fragmento in f for f in fallos),
                        f"esperaba un fallo con «{fragmento}», hubo {fallos}")

    def test_casos_que_deben_pasar(self):
        casos = {
            "página correcta": pagina(TECHOS),
            "con texto de plantilla repetido": pagina(TECHOS + "<p>Cotiza hoy mismo.</p>"),
        }
        for nombre, vivo in casos.items():
            with self.subTest(nombre):
                self.assertEqual(self.revisar(vivo), [])

    def test_casos_que_deben_fallar(self):
        casos = {
            "embed de la hermana": (pagina(LIMPIEZA), {}),
            "payload alterado": (pagina(TECHOS), {"propio": TECHOS.replace("membrana", "lámina")}),
            "hermana pegada debajo": (pagina(TECHOS + LIMPIEZA), {}),
            "vecina del municipio pegada": (pagina(TECHOS + VECINA), {"vecinas": [VECINA]}),
            "payload sin embed": (pagina(TECHOS), {"propio": ""}),
        }
        for nombre, (vivo, extra) in casos.items():
            with self.subTest(nombre):
                self.assertTrue(self.revisar(vivo, **extra),
                                "un caso incorrecto no puede pasar en verde")

    def test_embed_de_la_hermana_reporta_identidad(self):
        self.assertFalla(self.revisar(pagina(LIMPIEZA)), "no es el de su payload")

    def test_payload_con_una_frase_alterada_reporta_identidad(self):
        alterado = TECHOS.replace("garantía escrita", "garantía verbal")
        self.assertFalla(self.revisar(pagina(TECHOS), propio=alterado),
                         "no es el de su payload")

    def test_texto_de_la_vecina_reporta_la_contaminacion(self):
        self.assertFalla(self.revisar(pagina(TECHOS + VECINA), vecinas=[VECINA]),
                         "otra comunidad del municipio")

    def test_una_frase_propia_en_un_style_no_cuenta(self):
        self.assertEqual(vc.frases(f"<style>{sorted(vc.frases(TECHOS))[0]}</style>"), set())


class ImagenSocialTest(unittest.TestCase):
    def test_tabla_de_og(self):
        vistos = {"https://cdn/og-1.png": "carolina/isla-verde/sellado-de-techo"}
        casos = {
            "sin og": ("", {}, "sin og:image"),
            "repetida": ("https://cdn/og-1.png", vistos, "repetida"),
            "propia": ("https://cdn/og-2.png", vistos, ""),
        }
        for nombre, (og, vistos_, esperado) in casos.items():
            with self.subTest(nombre):
                fallos = vc.revisar_og(og, vistos_)
                if esperado:
                    self.assertTrue(any(esperado in f for f in fallos), fallos)
                else:
                    self.assertEqual(fallos, [])


class CanonicalTest(unittest.TestCase):
    ESPERADO = "https://comunidades.ilatekpr.com/carolina/isla-verde/sellado-de-techo"

    def test_tabla_de_canonical(self):
        casos = {
            "propio": (self.ESPERADO, ""),
            "propio con barra final": (self.ESPERADO + "/", ""),
            "ausente": ("", "sin canonical"),
            "de la hermana": (self.ESPERADO.replace("sellado-de-techo", "limpieza"),
                             "canonical apunta a"),
        }
        for nombre, (canonical, esperado) in casos.items():
            with self.subTest(nombre):
                fallos = vc.revisar_canonical(canonical, self.ESPERADO)
                if esperado:
                    self.assertTrue(any(esperado in f for f in fallos), fallos)
                else:
                    self.assertEqual(fallos, [])

    def test_lee_el_link_de_la_pagina_viva(self):
        self.assertEqual(vc.canonical_de(pagina(TECHOS)), "")
        con = pagina(TECHOS).replace(
            "</head>", f'<link rel="canonical" href="{self.ESPERADO}"></head>')
        self.assertEqual(vc.canonical_de(con), self.ESPERADO)


class ContratoDeSalidaTest(unittest.TestCase):
    def test_contrato(self):
        casos = {(0, 0): 2, (48, 0): 0, (48, 1): 1}
        for (paginas, fallos), esperado in casos.items():
            with self.subTest(paginas=paginas, fallos=fallos):
                self.assertEqual(vc.codigo_salida(paginas, fallos), esperado)


if __name__ == "__main__":
    unittest.main()
