<script>
  import { onMount } from "svelte";
  import Highcharts from 'highcharts';
  import ExportingModule from 'highcharts/modules/exporting';
  import { Chart } from '@highcharts/svelte';

  onMount(() => {
    // ExportingModule(Highcharts);
  });

  $: options = {
      chart: {
        type: "column",
        height: 200,
        width: 300,
                
      },
      title: {
        text: "",
      },
      credits: {
        enabled: false
      },
      exporting:{
        enabled: false,
      },
      // subtitle: {
      //   text: 'Source: <a href="https://worldpopulationreview.com/world-cities" target="_blank">World Population Review</a>',
      // },
      xAxis: {
        type: "category",
        
        labels: {
          autoRotation: [-90],
          style: {
            fontSize: "13px",
            fontFamily: "Verdana, sans-serif",
          },
        },
      },
      
      yAxis: {
        min: 0,
        title: {
          text: "",
        },
        gridLineWidth: 0,
        visible: false,
      },
      plotOptions:{
        column: {
            pointPadding: 0.2,
            borderWidth: 0,
            borderRadius: '25%'
        }
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        pointFormat: "Score: <b>{point.y:.1f}</b>",
      },
      series: [
        {
          name: "Stats",
          colors: ["#154360"],
          colorByPoint: true,
          groupPadding: 0,
          data: [
            ["Tokyo", 37.33],
            ["Delhi", 31.18],
            ["Shanghai", 27.79],
            ["Sao Paulo", 22.23],
          ],
          // dataLabels: {
          //   enabled: true,
          //   rotation: -90,
          //   color: "#FFFFFF",
          //   inside: true,
          //   verticalAlign: "top",
          //   format: "{point.y:.1f}", // one decimal
          //   y: 10, // 10 pixels down from the top
          //   style: {
          //     fontSize: "13px",
          //     fontFamily: "Verdana, sans-serif",
          //   },
          // },

        },
      ],
    };

</script>

<Chart options={options} highcharts={Highcharts} />

