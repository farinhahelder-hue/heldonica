"""Cherche un sous-titre incruste dans le bas de l'image.

Une moyenne de region ne suffit pas : un texte court ne deplace pas la moyenne
d'une bande, et une metrique aveugle qui ne voit rien se lit trop facilement
comme une preuve d'absence. Elle avait deja fait conclure a tort.

On cherche donc la signature propre au calque : du blanc franc pose sur du noir
franc, dans le bas de l'image. Un texte blanc sur fond noir translucide donne
les deux au meme endroit, ce qu'une scene naturelle ne fait presque jamais.

    python soustitres.py montage.mp4
"""
import sys

import av
import numpy as np

from rotation import angle_de

chemin = sys.argv[1]
angle = angle_de(chemin)
print(f"rotation de la piste : {angle} deg")

conteneur = av.open(chemin)
piste = conteneur.streams.video[0]

lignes = []
for image in conteneur.decode(piste):
    t = float(image.pts * piste.time_base)
    y = image.to_ndarray(format='gray')
    if angle:
        y = np.rot90(y, k=-angle // 90)
    h = y.shape[0]
    bas = y[int(h * 0.55):int(h * 0.90), :]
    total = bas.size
    sombre = float((bas < 40).sum()) / total
    clair = float((bas > 225).sum()) / total
    # Le calque n'est present que si les deux le sont ensemble.
    lignes.append((t, sombre, clair, min(sombre, clair)))

conteneur.close()

print(f"{len(lignes)} images, {lignes[-1][0]:.2f} s")
print("\n  temps   noir franc   blanc franc   signature")
pas, prochain = 0.5, 0.0
for t, sombre, clair, sig in lignes:
    if t >= prochain:
        print(f"  {t:5.2f}   {sombre:9.4f}   {clair:10.4f}   {sig:9.4f}"
              f"  {'#' * int(sig * 2000)}")
        prochain += pas

fort = max(lignes, key=lambda l: l[3])
print(f"\nSignature la plus forte : {fort[0]:.2f} s "
      f"(noir {fort[1]:.4f}, blanc {fort[2]:.4f})")
