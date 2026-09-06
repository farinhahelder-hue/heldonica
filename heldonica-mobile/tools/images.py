"""Extrait quelques images du montage, redressees, pour les regarder.

La luminance dit qu'un calque assombrit l'image ; elle ne dit pas ce qui est
ecrit dessus. Pour le texte fixe et les sous-titres, il faut voir — les mesures
de region sont trop grossieres pour un texte court, et une metrique qui ne voit
rien n'est pas une preuve d'absence.

    python images.py montage.mp4 1.5 4.0 7.2

Ecrit une image PNG par instant demande, dans le dossier courant.
"""
import sys

import av
import numpy as np
from PIL import Image

from rotation import angle_de

chemin = sys.argv[1]
instants = [float(a) for a in sys.argv[2:]]

# Sans la rotation de la piste, on regarde l'image couchee et le bas de l'ecran
# se retrouve sur un cote.
angle = angle_de(chemin)

conteneur = av.open(chemin)
piste = conteneur.streams.video[0]

restants = sorted(instants)
for image in conteneur.decode(piste):
    if not restants:
        break
    t = float(image.pts * piste.time_base)
    if t >= restants[0]:
        cible = restants.pop(0)
        tableau = image.to_ndarray(format='rgb24')
        if angle:
            # np.rot90 tourne dans le sens direct, la matrice dans l'autre.
            tableau = np.rot90(tableau, k=-angle // 90)
        vue = Image.fromarray(tableau)
        # Reduite : la pleine resolution d'un Reel pese pour rien a l'ecran.
        vue = vue.resize((vue.width // 3, vue.height // 3))
        nom = f"image-{cible:.2f}.png".replace('.', '_', 1)
        vue.save(nom)
        print(f"{nom} : image a {t:.2f} s")

conteneur.close()
