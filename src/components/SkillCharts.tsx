import * as React from 'react';
import Box from "@mui/material/Box";
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

const chartDef = [
    {
        label: 'AI/ML',
        data: [
            { label: 'We know', value: 50, color: '#f37b83' },
            { label: 'Improving', value: 50, color: '#ab9da191' }]
    },
    {
        label: 'Frontend',
        data: [
            { label: 'We know', value: 80, color: '#f37b83' },
            { label: 'Improving', value: 20, color: '#ab9da191' }]
    },
    {
        label: 'UI/UX',
        data: [
            { label: 'We know', value: 70, color: '#f37b83' },
            { label: 'Improving', value: 30, color: '#ab9da191' }]
    },
    {
        label: 'Backend',
        data: [
            { label: 'We know', value: 80, color: '#f37b83' },
            { label: 'Improving', value: 20, color: '#ab9da191' }]
    }
];

const settings = {
    margin: { right: 1 },
    width: 250,
    height: 250,
    hideLegend: true,
};


const StyledText = styled('text')(() => ({
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fontSize: '2em',
    fill: '#f37b83',
}));

function PieCenterLabel({ children }: { children: React.ReactNode }) {
    const { width, height, left, top } = useDrawingArea();
    return (
        <StyledText x={left + width / 2} y={top + height / 2}>
            {children}
        </StyledText>
    );
}


export function donutChart(chartItem: any) {
    return (
        <PieChart
            series={[{
                innerRadius: 60, outerRadius: 120, data: chartItem.data, cornerRadius: 10, paddingAngle: 1, arcLabel: (item) => item.label == 'We know' ? `${item.value}%` : '',
                arcLabelMinAngle: 35,
                arcLabelRadius: '70%',
            }]}

            {...settings}
            sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                    fontWeight: 'bold',
                    fontSize: '1.2em',
                    color: '#f9f0ff',
                },
                flexDirection: 'column', alignItems: 'flex-start'
            }}
        >
            <PieCenterLabel>{chartItem.label}</PieCenterLabel>
        </PieChart>
    );
}



export function DonutCharts() {

    const chartItems: any[] = []

    chartDef.forEach(item => {
        chartItems.push(donutChart(item))
    });

    return chartItems
}





export default function SkillCharts() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', padding: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {DonutCharts()}
        </Box>
    );
}