"""Check local links, SEO consistency, and sitemap coverage without dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import xml.etree.ElementTree as ET
import json
ROOT=Path(__file__).resolve().parent.parent
class Page(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.canon=[];self.ids=[];self.noindex=False;self.h1=0;self.schema=False;self.schema_text='';self.schemas=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='h1':self.h1+=1
  if tag=='link' and a.get('rel')=='canonical':self.canon.append(a['href'])
  if tag=='meta' and a.get('name')=='robots':self.noindex='noindex' in a.get('content','')
  if tag=='script' and a.get('type')=='application/ld+json':self.schema=True;self.schema_text=''
  for key in ('href','src','poster'):
   if key in a and not(tag=='link' and a.get('rel')=='canonical'):self.links.append(a[key])
 def handle_data(self,data):
  if self.schema:self.schema_text+=data
 def handle_endtag(self,tag):
  if tag=='script' and self.schema:self.schemas.append(json.loads(self.schema_text));self.schema=False
pages={}
for p in ROOT.rglob('*.html'):
 if any(x.startswith('.') for x in p.relative_to(ROOT).parts):continue
 parser=Page();parser.feed(p.read_text());pages[p.resolve()]=parser
errors=[]
for path,page in pages.items():
 rel=path.relative_to(ROOT).as_posix()
 if len(page.canon)!=1:errors.append(f'{rel}: canonical count {len(page.canon)}')
 elif not page.canon[0].startswith('https://www.social-gear.com/'):errors.append(f'{rel}: incorrect canonical host')
 if len(page.ids)!=len(set(page.ids)):errors.append(f'{rel}: duplicate ids')
 for link in page.links:
  url=urlparse(link)
  if url.scheme or url.netloc:continue
  target=(ROOT/url.path.lstrip('/') if url.path.startswith('/') else path.parent/url.path) if url.path else path
  if target.is_dir():target=target/'index.html'
  target=target.resolve()
  if not target.exists():errors.append(f'{rel}: missing {link}')
  elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:errors.append(f'{rel}: missing anchor {link}')
urls=[el.text for el in ET.parse(ROOT/'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(urls)==len(set(urls)), 'Duplicate sitemap URLs'
for url in urls:
 path=ROOT/(urlparse(url).path.lstrip('/') or 'index.html');page=pages.get(path.resolve())
 if not page:errors.append(f'Sitemap missing page: {url}');continue
 if page.noindex or page.canon!=[url]:errors.append(f'Sitemap conflicts with canonical/indexability: {url}')
 if page.h1!=1:errors.append(f'{path.name}: expected one h1, got {page.h1}')
print(f'Checked {len(pages)} HTML files, {len(urls)} sitemap URLs, local assets, anchors, IDs, and structured data.')
if errors:
 print('\n'.join(errors));raise SystemExit(1)
print('All checks passed.')
