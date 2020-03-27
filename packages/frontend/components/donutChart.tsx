import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

type Props = {
  used: number,
  available: number
}

export const DonutChart = (props: Props) => {
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={{
        title: false,
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            colors: ['#FF8A65', '#21D2BF'],
            dataLabels: {
              enabled: false,
            },
            showInLegend: true
          }
        },
        series: [{
          name: 'Mandate',
          colorByPoint: true,
          data: [{
            name: 'Used',
            y: props.used,
          }, {
            name: 'Available',
            y: props.available
          }
          ]
        }]
      }}
    />
  )
}
