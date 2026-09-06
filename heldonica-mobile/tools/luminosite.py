"""Luminosite moyenne au fil du montage, pour voir le fondu au noir.

Le fondu assombrit toute l'image : la moyenne du plan Y suffit a le detecter, et
elle ne depend pas de l'orientation. C'est la mesure qui a montre qu'un fondu
demande ne s'incrustait pas du tout, puis qu'il ne se fermait que d'un cote.

    python luminosite.py montage.mp4

A la coupe, on attend un creux net vers zero. Un profil qui ne descend jamais
sous la centaine veut dire que le calque n'est pas applique — quoi qu'en dise le
journal de l'application.
"""
import sys

import av

chemin = sys.argv[1]
conteneur = av.open(chemin)
piste = conteneur.streams.video[0]

mesures = []
for image in conteneur.decode(piste):
    t = float(image.pts * piste.time_base)
    # Luminance moyenne : le plan Y du format YUV, sans conversion couteuse.
    y = image.to_ndarray(format='gray')
    mesures.append((t, float(y.mean())))

conteneur.close()

print(f"{len(mesures)} images, duree {mesures[-1][0]:.2f} s\n")

# Profil general, une valeur par demi-seconde.
print("Profil (une mesure par demi-seconde) :")
pas = 0.5
prochain = 0.0
for t, l in mesures:
    if t >= prochain:
        print(f"  {t:5.2f} s  {l:6.1f}  {'#' * int(l / 4)}")
        prochain += pas

# Le creux le plus sombre.
creux = min(mesures, key=lambda m: m[1])
print(f"\nImage la plus sombre : {creux[0]:.2f} s, luminance {creux[1]:.1f}")

# Autour du creux, au detail de l'image.
print("\nDetail autour du creux :")
for t, l in mesures:
    if abs(t - creux[0]) <= 0.45:
        print(f"  {t:5.2f} s  {l:6.1f}  {'#' * int(l / 4)}")
