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
    <div id="mapcont">
        <div id="map"></div>
        <div id="panel">
            <div>
                <input type="radio" name="p_select" id="p_votes"><label for="p_votes">Явка и распределение голосов</label>
            </div>
            <hr/>
            %for party in parties:
                <div>
                    <input onChange="NGe.setRenderer('partyVote', {party_id: ${party.id}});" type="radio" name="p_select" id="p_party_${party.id}" 
                    %if party.id == 5:
                        checked="yes"
                    %endif
                    ><label for="p_party_${party.id}">${party.name}</label>
                </div>
            %endfor
            <div>
                
            </div>
        </div>
    </div>

    <div id="holder"></div> 
    <div class="tooltip"></div>

</body>
