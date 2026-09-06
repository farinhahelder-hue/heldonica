"""Lit la matrice d'affichage d'un MP4, dans la boite tkhd.

Un lecteur ne montre pas l'image telle qu'elle est encodee : la piste porte une
matrice de rotation, et le decodeur brut l'ignore. Les montages sortent du
telephone couches, avec 90 degres de rotation dans la piste.

Sans lire cette matrice, on mesure une image couchee en croyant mesurer celle
que voit l'utilisateur — et le bas de l'ecran se retrouve sur un cote. Une
premiere version de bandeau.py cherchait ainsi les sous-titres au mauvais
endroit, et concluait a leur absence sans avoir rien regarde.

    python rotation.py montage.mp4
"""
import math
import struct
import sys


def boites(f, fin, profondeur=0):
    """Parcourt les boites MP4, en descendant dans celles qui en contiennent."""
    while f.tell() < fin:
        debut = f.tell()
        entete = f.read(8)
        if len(entete) < 8:
            return
        taille, nom = struct.unpack('>I4s', entete)
        nom = nom.decode('latin-1')
        if taille == 1:
            taille = struct.unpack('>Q', f.read(8))[0]
        if taille < 8:
            return
        yield profondeur, nom, debut, taille
        if nom in ('moov', 'trak', 'mdia', 'minf', 'stbl'):
            yield from boites(f, debut + taille, profondeur + 1)
        f.seek(debut + taille)


def angle_de(chemin):
    """Rotation en degres de la piste video, ou 0 si le fichier n'en porte pas."""
    with open(chemin, 'rb') as f:
        f.seek(0, 2)
        fin = f.tell()
        f.seek(0)
        trouve = 0
        for _, nom, debut, _taille in boites(f, fin):
            if nom != 'tkhd':
                continue
            f.seek(debut + 8)
            version = f.read(1)[0]
            f.read(3)                        # drapeaux
            f.read(8 if version == 0 else 16)  # creation et modification
            f.read(4)                        # identifiant de piste
            f.read(4)                        # reserve
            f.read(4 if version == 0 else 8)   # duree
            f.read(8 + 2 + 2 + 2 + 2)        # reserve, calque, groupe, volume
            m = struct.unpack('>9i', f.read(36))
            largeur = struct.unpack('>I', f.read(4))[0] >> 16
            hauteur = struct.unpack('>I', f.read(4))[0] >> 16
            if not largeur or not hauteur:
                continue  # la piste son, qui n'a pas de dimensions
            # a et b sont en virgule fixe 16.16 ; l'angle se lit sur eux.
            a, b = m[0] / 65536.0, m[1] / 65536.0
            trouve = round(math.degrees(math.atan2(b, a))) % 360
        return trouve


if __name__ == '__main__':
    chemin = sys.argv[1]
    print(f"rotation de la piste video : {angle_de(chemin)} deg")
