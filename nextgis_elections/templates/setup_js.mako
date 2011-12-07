<% import json %>

NGe.rootUnit = ${'%014d' % (77 * 1e12) | n, json.dumps};

NGe.routes = {
    home: ${request.route_url('home') | n, json.dumps},
    data: ${request.route_url('data') | n, json.dumps}  
};


<% 
pdict = dict()
count = 10
for p in parties:
    pdict[p.id] = dict(name=p.name, color='#' + p.color if p.color else None)
    if p.color:
        pdict[p.id]['pal'] = []
        ch = (int(p.color[0:2],16), int(p.color[2:4],16), int(p.color[4:6],16))
        for i in range(count):
            pdict[p.id]['pal'].append('#' + ('%02x%02x%02x' % tuple([int(((count - 1.0) - i) * c / (count - 1.0) + (i) * 255 / (count - 1.0))   for c in ch])))

%>
NGe.parties = ${pdict | n, json.dumps};