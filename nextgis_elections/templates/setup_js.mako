<% import json %>

NGe.rootUnit = ${'%014d' % (77 * 1e12) | n, json.dumps};

NGe.routes = {
    home: ${request.route_url('home') | n, json.dumps},
    data: ${request.route_url('data') | n, json.dumps},
    unitSearch: ${request.route_url('unit.search') | n, json.dumps}
};


<% 
pdict = dict()
count = 10
for p in parties:
    pdict[p.id] = dict(name=p.name, color='#' + p.color if p.color else None)
%>
NGe.parties = ${pdict | n, json.dumps};