import math
import itertools
import collections
import string
import pprint

config = [12,7,5]

def J(d, m, k):
    if len(d) < 2 or len(m) < 1:
        return k
    k = J(d[1:], m[1:], k)
    return math.floor((k * d[0] + m[0]) / d[1])

ms = itertools.product(
    *(range(a*b) for a, b in itertools.pairwise(config))
)

scales_to_m = collections.defaultdict(list)

for m in ms:
    pcs = tuple(
        J(config, m, k) % config[0] for k in range(config[-1])
    )
    scales_to_m[pcs].append(m)

pcs = frozenset({0, 7})

def print_scale(scale):
    ret = ""
    alpha = string.digits + string.ascii_uppercase
    for pc in range(config[0]):
        if pc in scale:
            ret += alpha[pc]
        else:
            ret += " "
    return ret

pprint.pp(
    {print_scale(scale): m for scale, m in scales_to_m.items() if pcs <= set(scale)}
)
