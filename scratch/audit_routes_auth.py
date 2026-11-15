import ast
from pathlib import Path

source = Path("dealbot_backend/dealbot/api.py").read_text(encoding="utf-8")
tree = ast.parse(source)

routes = []
for node in tree.body:
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
        for dec in node.decorator_list:
            call = None
            if isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute) and dec.func.attr in ("get", "post", "put", "delete", "patch"):
                call = dec
            if call:
                method = call.func.attr.upper()
                path = call.args[0].value if (call.args and isinstance(call.args[0], ast.Constant)) else "dynamic"
                # Check parameters for validate_admin_token
                params_str = ast.unparse(node.args)
                is_admin_strict = "validate_admin_token" in params_str and "validate_admin_token_optional" not in params_str
                is_admin_opt = "validate_admin_token_optional" in params_str
                routes.append((method, path, node.name, is_admin_strict, is_admin_opt))

print(f"Total routes discovered via AST: {len(routes)}")

admin_keywords = ["approve", "reject", "delete", "purge", "settings", "channels/config", "config", "broadcast", "sync"]

for method, path, name, strict, opt in routes:
    if any(k in path for k in admin_keywords) or any(k in name for k in admin_keywords):
        status = "[STRICT ADMIN]" if strict else ("[OPTIONAL ADMIN]" if opt else "[PUBLIC/UNPROTECTED]")
        print(f"{method:<6} {path:<50} {status}")
