let map;

function initializeMap() {
    map = new maptiler.Map({
        container: 'map',
        style: 'https://api.maptiler.com/maps/02c3290e-4c70-4f5f-8701-51554ec4cfb2/style.json?key=TbsQ5qLxJHC20Jv4Th7E',
        center: [-123.25260, 44.71041], // Replace with actual longitude and latitude
        zoom: 8.4
    });

    map.on('load', () => {
        const datasets = [
            {
                id: 'new-construction',
                data: 'https://api.maptiler.com/data/9066d146-9207-456b-ae1c-a2a064aaa60d/features.json?key=TbsQ5qLxJHC20Jv4Th7E',
                marker: 'construction-15', // Built-in Mapbox Maki icon
                color: '#FF711F'
            },
            {
                id: 'recently-sold',
                data: 'https://api.maptiler.com/data/28992c2c-ad93-4699-acee-ef44ecf52cb6/features.json?key=TbsQ5qLxJHC20Jv4Th7E',
                marker: 'https://img.icons8.com/external-flatart-icons-flat-flatarticons/64/000000/external-dollar-finance-flatart-icons-flat-flatarticons.png', // Custom icon URL
                color: '#28B463'
            },
            {
                id: 'currently-for-sale',
                data: 'https://api.maptiler.com/data/fed38d64-6b6e-4186-9652-c70fa9f0735c/features.json?key=TbsQ5qLxJHC20Jv4Th7E',
                marker: 'https://img.icons8.com/external-flatart-icons-flat-flatarticons/64/000000/external-money-finance-flatart-icons-flat-flatarticons.png', // Custom icon URL
                color: '#FFC300'
            }
            // {
            //     id: 'crm-owners',
            //     data: 'url-to-your-crm-owners-geojson',
            //     marker: 'circle-15', // Built-in Mapbox Maki icon
            //     color: '#3498DB'
            // }
        ];

        datasets.forEach(dataset => {
            // Fetch the GeoJSON data
            fetch(dataset.data)
                .then(response => response.json())
                .then(geojson => {
                    // Add the GeoJSON data as a source
                    map.addSource(dataset.id, {
                        type: 'geojson',
                        data: geojson
                    });

                    // Add a layer to display the points
                    map.addLayer({
                        id: `${dataset.id}-points`,
                        type: 'symbol',
                        source: dataset.id,
                        layout: {
                            'icon-image': dataset.marker.startsWith('https://') ? `url(${dataset.marker})` : dataset.marker,
                            'icon-size': 1.5
                        },
                        paint: {
                            'icon-color': dataset.color
                        }
                    });

                    // Add popups
                    map.on('click', `${dataset.id}-points`, (e) => {
                        const coordinates = e.features[0].geometry.coordinates.slice();
                        const { name, address, description } = e.features[0].properties;

                        // Ensure the popup is displayed in the right location
                        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                        }

                        new maptiler.Popup()
                            .setLngLat(coordinates)
                            .setHTML(`
                                <strong>${name}</strong><br>
                                ${address}<br>
                                ${description}
                            `)
                            .addTo(map);
                    });

                    // Change the cursor to a pointer when over a clickable point
                    map.on('mouseenter', `${dataset.id}-points`, () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });

                    // Change it back to the default when leaving
                    map.on('mouseleave', `${dataset.id}-points`, () => {
                        map.getCanvas().style.cursor = '';
                    });
                });
        });
    });
}

window.onload = initializeMap;