document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Particle Percent on Right Side',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Step',
                        font: {
                            size: 18
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        }
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Percent',
                        font: {
                            size: 18
                        }
                    },
                    ticks: {
                        font: {
                            size: 14
                        },
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    stepSize: 20,
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 16
                        }
                    }
                }
            }
        }
    });

    let stepCounter = 1;

    window.updateChart = function(value) {
        const initialDataSize = 200;
        if (chart.data.labels.length >= initialDataSize) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.data.labels.push(stepCounter++);
        chart.data.datasets[0].data.push(value);
        chart.update();
    };

    window.resetChart = function() {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        stepCounter = 1;
        chart.update();
    };
});
