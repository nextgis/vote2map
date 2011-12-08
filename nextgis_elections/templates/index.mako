<!DOCTYPE html>
<html>
<head>

    <title>Elections map</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">

    <!-- CSS -->
    <link rel="stylesheet" href="${request.static_url('nextgis_elections:static/css/map.css')}" type="text/css">

    <!-- jQuery Tools library -->
    <script src="${request.static_url('nextgis_elections:static/jquery/jquery.tools.min.js')}"></script>

    <!-- OpenLayers library -->
    <script src="${request.static_url('nextgis_elections:static/openlayers/OpenLayers.js')}"></script>

    <!-- geostats library -->
    <script src="${request.static_url('nextgis_elections:static/geostat/geostats.js')}"></script>

    <!-- Main section -->
    <script src="${request.static_url('nextgis_elections:static/js/main.js')}" type="text/javascript"></script>
    <script src="${request.static_url('nextgis_elections:static/js/render.js')}" type="text/javascript"></script>
    <script src="${request.route_url('setup_js')}" type="text/javascript"></script>

    <script src="http://www.openstreetmap.org/openlayers/OpenStreetMap.js" type="text/javascript"></script>

</head>
<body onload="init()">
    %for i in range(4):
        <a class="breadcrumb" id="bc_${i+1}" href="#" onClick="NGe.selectBreadcrumb(${i+1});"></a>
    %endfor
    <div id="mapcont">
        <div id="map"></div>
        <div id="panel">
            <ul class="menu">
                <li class="">
                    <input onChange="NGe.setRenderer('presence', {});"
                        type="radio" name="p_select" id="p_votes" checked="yes">
                        <label for="p_votes">Явка и распределение голосов</label>
                </li>
                %for party in parties:
                    <li class="icon p_party_${party.id}">
                        <input onChange="NGe.setRenderer('partyVote', {party_id: ${party.id}});"
                            type="radio" name="p_select" id="p_party_${party.id}">
                        <label for="p_party_${party.id}">${party.name}</label>
                    </li>
                %endfor
            </ul>
                
        </div>
    </div>

    <div id="legend"></div>

    <div id="holder"></div> 
    <div class="tooltip"></div>

    <div id="help">
        Щелкайте по объектам для перехода на другой уровень. Наведите мышь, чтобы увидеть сводные результаты. Используйте панель навигации над картой чтобы переходить на предыдущие уровни.
    </div>

</body>
