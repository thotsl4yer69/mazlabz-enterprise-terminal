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


def make_anatomical_model(segments=60, rings=32):
    length = 7.5
    base_r = 1.25
    verts = []
    # shaft with slight curvature and taper
    for i in range(segments):
        z = (length * 0.85 / (segments - 1)) * i
        taper = 1 - 0.35 * (z / length)
        r = base_r * taper
        curve_y = 0.3 * np.sin(z / length * np.pi)
        offset_x = 0.2 * np.sin(z / length)
        for j in range(rings):
            t = 2 * np.pi * j / rings
            x = r * np.cos(t) + offset_x
            y = r * np.sin(t) + curve_y
            verts.append([x, y, z - length / 2])

    # glans
    tip_z = length * 0.9 - length / 2
    for i in range(rings // 2 + 1):
        phi = (np.pi / 2) * i / (rings // 2)
        r = base_r * 0.8 * np.cos(phi)
        z = tip_z + base_r * 0.8 * np.sin(phi)
        for j in range(rings):
            t = 2 * np.pi * j / rings
            verts.append([
                r * np.cos(t),
                r * np.sin(t),
                z,
            ])

    # scrotum
    ball_r = 1.4
    ball_z = -length / 2 - ball_r * 0.3
    offset = 0.8
    for sx in (-offset, offset):
        for i in range(rings + 1):
            phi = np.pi * i / rings
            r = ball_r * np.sin(phi)
            z = ball_z + ball_r * np.cos(phi)
            for j in range(rings):
                t = 2 * np.pi * j / rings
                x = sx + r * np.cos(t)
                y = r * np.sin(t)
                verts.append([x, y, z])

    # pelvic attachment
    root_len = length * 0.15
    root_r = base_r * 0.9
    for i in range(segments // 4):
        z = -root_len * i / (segments // 4)
        for j in range(rings):
            t = 2 * np.pi * j / rings
            x = root_r * np.cos(t)
            y = root_r * np.sin(t)
            verts.append([x, y, z - length / 2])

    return np.array(verts)


def project(points):
    z = points[:, 2] + DEPTH
    factor = K / z
    x = (points[:, 0] * factor * ASPECT + WIDTH / 2).astype(int)
    y = (points[:, 1] * factor + HEIGHT / 2).astype(int)
    return x, y, z


def render_frame(vertices, yaw, pitch=0.0):
    R = rotation_matrix([0, 1, 0], yaw) @ rotation_matrix([1, 0, 0], pitch)
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
    yaw = 0.0
    pitch = 0.2
    try:
        while True:
            clear()
            frame = render_frame(vertices, yaw, pitch)
            sys.stdout.write(frame)
            sys.stdout.flush()
            yaw += 0.1
            pitch += 0.02
            time.sleep(1/30)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
