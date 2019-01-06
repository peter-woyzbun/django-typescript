

def render_type_declaration(name: str, optional: bool, readonly: bool, type_: str):
    return (readonly * "readonly ") + name + (optional * "?") + ": " + type_