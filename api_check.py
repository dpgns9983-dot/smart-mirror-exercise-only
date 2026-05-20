import json, os, re
from urllib import request, error

base = 'http://192.168.219.44:9000'
if os.path.exists('.env'):
    for line in open('.env', encoding='utf-8'):
        if line.startswith('VITE_PC3_URL='):
            base = line.split('=',1)[1].strip().strip('"').strip("'")
            break

results = []

def call(step, method, path, body=None):
    url = base + path
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = request.Request(url, data=data, headers=headers, method=method)
    status = -1
    text = ''
    try:
        with request.urlopen(req, timeout=20) as resp:
            status = resp.getcode()
            text = resp.read().decode('utf-8', errors='replace')
    except error.HTTPError as e:
        status = e.code
        text = e.read().decode('utf-8', errors='replace')
    except Exception as e:
        text = str(e)
    obj = None
    try:
        obj = json.loads(text) if text else None
    except Exception:
        pass
    keys = []
    if isinstance(obj, dict):
        keys = list(obj.keys())
    elif isinstance(obj, list) and obj and isinstance(obj[0], dict):
        keys = list(obj[0].keys())
    results.append({'step': step, 'status': status, 'path': path, 'keys': keys, 'obj': obj, 'raw': text})
    return obj

obj1 = call('1) GET /api/users/profiles','GET','/api/users/profiles')
uid = 1
if isinstance(obj1, list) and obj1 and isinstance(obj1[0], dict) and 'id' in obj1[0]:
    uid = obj1[0]['id']
elif isinstance(obj1, dict):
    for k in ('profiles','data'):
        if isinstance(obj1.get(k), list) and obj1[k] and isinstance(obj1[k][0], dict) and 'id' in obj1[k][0]:
            uid = obj1[k][0]['id']; break
    if 'id' in obj1: uid = obj1['id']

call('2) GET /api/users/{id}/progress?days=30','GET',f'/api/users/{uid}/progress?days=30')
obj3 = call('3) POST /api/sessions/start','POST','/api/sessions/start',{'user_id':uid,'mode':'exercise','goal':'squat'})
sid = 1
if isinstance(obj3, dict):
    if 'session_id' in obj3: sid = obj3['session_id']
    elif 'id' in obj3: sid = obj3['id']
    elif isinstance(obj3.get('session'), dict) and 'id' in obj3['session']: sid = obj3['session']['id']
    elif isinstance(obj3.get('data'), dict) and 'id' in obj3['data']: sid = obj3['data']['id']

call('4) POST /api/sessions/{session_id}/stop','POST',f'/api/sessions/{sid}/stop')
call('5) GET /api/sessions/{session_id}/result','GET',f'/api/sessions/{sid}/result')
call('6) GET /api/coach/logs/{id}?limit=5','GET',f'/api/coach/logs/{uid}?limit=5')

all_keys = set()
def walk(x):
    if isinstance(x, dict):
        for k,v in x.items():
            all_keys.add(k)
            walk(v)
    elif isinstance(x, list):
        for i in x: walk(i)
for r in results: walk(r['obj'])

candidates = [
 ('posture_score',['posture','pose','form_score']),
 ('joint_angles',['angle','angles','joint']),
 ('keypoints/landmarks',['keypoint','landmark','skeleton']),
 ('rep_count',['rep','count']),
 ('feedback/coaching',['feedback','coach','advice','tip','correction']),
 ('before_media',['before','pre_image','pre_video']),
 ('after_media',['after','post_image','post_video']),
 ('comparison_metrics',['comparison','improvement','change','delta','diff']),
 ('timestamp/frame',['timestamp','time','frame']),
]

print('BASE_URL', base)
print('SELECTED_USER_ID', uid)
print('SELECTED_SESSION_ID', sid)
print('---STEPS---')
for r in results:
    print(f"{r['step']} | status={r['status']} | keys={','.join(r['keys']) if r['keys'] else '-'}")
print('---USABLE_FIELDS---')
for name,pats in candidates:
    hit = any(any(p in k.lower() for p in pats) for k in all_keys)
    matched = sorted([k for k in all_keys if any(p in k.lower() for p in pats)])
    print(f"{name}\t{'yes' if hit else 'no'}\t{', '.join(matched[:8]) if matched else '-'}")
print('---ALL_KEYS---')
print(', '.join(sorted(all_keys)) if all_keys else '-')
