from typing import Dict, Tuple, Type


# =================================
# Type Map Dict
# ---------------------------------

class TypeMapDict(object):

    def __init__(self, type_map: Dict[Type, Type], default=None):
        self.type_map = type_map
        self.default = default

    def __getitem__(self, item):
        if type(item) in self.type_map:
            return self.type_map[type(item)]
        return self.default
