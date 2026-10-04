"""Local preview server with a layout-save endpoint for the board's edit mode.

    python3 tools/serve.py        # then open http://localhost:8765/?edit
"""
import http.server
import json
import os
import re
import socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, 'index.html')
PORT = int(os.environ.get('PORT', 8765))
ITEM_STYLE = re.compile(r'(<[a-z0-9]+ class="item[ "][^>]*?style=")([^"]*)(")')


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        if self.path != '/__save_layout':
            self.send_error(404)
            return
        try:
            styles = json.loads(self.rfile.read(int(self.headers['Content-Length'])))['styles']
            html = open(INDEX, encoding='utf-8').read()
            found = ITEM_STYLE.findall(html)
            if len(found) != len(styles):
                raise ValueError(f'board has {len(found)} items but got {len(styles)}')
            it = iter(styles)
            html = ITEM_STYLE.sub(lambda m: m.group(1) + next(it).replace('"', '') + m.group(3), html)
            open(INDEX, 'w', encoding='utf-8').write(html)
            body, code = b'{"ok":true}', 200
        except Exception as exc:  # report back to the editor toolbar
            body, code = json.dumps({'ok': False, 'error': str(exc)}).encode(), 400
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(body)


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    print(f'Serving {ROOT} at http://localhost:{PORT}/  (edit mode: http://localhost:{PORT}/?edit)')
    Server(('', PORT), Handler).serve_forever()
