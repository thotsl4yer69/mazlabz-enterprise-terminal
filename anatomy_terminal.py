import os
import sys
import time
import numpy as np

WIDTH, HEIGHT = 80, 40
ASPECT = WIDTH / HEIGHT
CHARS = np.array(list(" .:-=+*#%@"))
DEPTH = 20
K = 15


def rotation_matrix(axis, theta):
    axis = np.asarray(axis)
    axis = axis / np.linalg.norm(axis)
    a = np.cos(theta / 2.0)
    b, c, d = -axis * np.sin(theta / 2.0)
    aa, bb, cc, dd = a * a, b * b, c * c, d * d
    bc, ad, ac, ab, bd, cd = b * c, a * d, a * c, a * b, b * d, c * d
    return np.array([
        [aa + bb - cc - dd, 2 * (bc + ad), 2 * (bd - ac)],
        [2 * (bc - ad), aa + cc - bb - dd, 2 * (cd + ab)],
        [2 * (bd + ac), 2 * (cd - ab), aa + dd - bb - cc],
    ])


def make_anatomical_model(segments=40, rings=20):
    length = 6.0
    radius = 1.0
    z = np.linspace(0, length, segments)
    theta = np.linspace(0, 2 * np.pi, rings)
    z_grid, t_grid = np.meshgrid(z, theta)
    taper = 0.8 + 0.2 * np.cos(z_grid / length * np.pi)
    r_grid = radius * taper
    x = r_grid * np.cos(t_grid)
    y = r_grid * np.sin(t_grid) + 0.2 * np.sin(z_grid / length * np.pi)
    verts = np.stack((x, y, z_grid - length / 2), axis=-1)
    return verts.reshape(-1, 3)


def project(points):
    z = points[:, 2] + DEPTH
    factor = K / z
    x = (points[:, 0] * factor * ASPECT + WIDTH / 2).astype(int)
    y = (points[:, 1] * factor + HEIGHT / 2).astype(int)
    return x, y, z


def render_frame(vertices, angle):
    R = rotation_matrix([0, 1, 0], angle)
    pts = vertices @ R.T
    x, y, z = project(pts)
    buf = np.full((HEIGHT, WIDTH), " ")
    zbuf = np.full((HEIGHT, WIDTH), np.inf)
    idx = (x >= 0) & (x < WIDTH) & (y >= 0) & (y < HEIGHT)
    x, y, z = x[idx], y[idx], z[idx]
    shade = (1 - (z - DEPTH) / 6).clip(0, 0.999)
    shades = CHARS[(shade * (len(CHARS) - 1)).astype(int)]
    for xi, yi, zi, sh in zip(x, y, z, shades):
        if zi < zbuf[yi, xi]:
            zbuf[yi, xi] = zi
            buf[yi, xi] = sh
    return "\n".join("".join(row) for row in buf)


def clear():
    os.system('cls' if os.name == 'nt' else 'clear')


def main():
    vertices = make_anatomical_model()
    angle = 0.0
    try:
        while True:
            clear()
            frame = render_frame(vertices, angle)
            sys.stdout.write(frame)
            sys.stdout.flush()
            angle += 0.1
            time.sleep(1/30)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
