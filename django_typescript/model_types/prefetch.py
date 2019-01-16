from django_typescript.core import types


# =================================
# Prefetch Tree to Select Related
# ---------------------------------

def prefetch_select_related(prefetch_tree: types.PrefetchTree):
    if isinstance(prefetch_tree, str):
        return prefetch_tree
    else:
        return list(prefetch_tree.keys())[0] + "__" + prefetch_select_related(list(prefetch_tree.values())[0])

