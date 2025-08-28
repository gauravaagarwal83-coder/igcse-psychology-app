#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="/Users/gauravaagarwal/Documents/kiro-proj/igcse-psychology-app", **kwargs)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    print(f"Admin page: http://localhost:{PORT}/admin.html")
    httpd.serve_forever()