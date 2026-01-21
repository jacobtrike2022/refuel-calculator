'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './globals.css';

// Base64 encoded Trike logo for reliable PDF rendering
const TRIKE_LOGO_BASE64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJMYXllcl8yIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTI5LjM1IDM4My43OCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNmZjczM2M7fTwvc3R5bGU+PC9kZWZzPjxnIGlkPSJMYXllcl8xLTIiPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTY3Ni4zNSw5OS41MWMwLDkuMjMtOS4yMywyMC4xNC0yMy40OSwyMC4xNGgtOS4yM2MtMjMuMjIsMi41Mi0zMC40OSwxNC41NS01MS43NSw2Ni44NWwtMzkuMTYsOTYuMjItMTAuMDcsMjQuMzNjLTUuMDMsMTIuMzEtMTMuOTksMTcuMDYtMjEuODIsMTcuMDYtOC45NSwwLTE2LjUtNS44Ny0xNi41LTE1Ljk0LDAtMy4wOC41Ni02LjE1LDEuOTYtOS43OWw2LjQzLTE1LjY2LDM5LjE2LTk1Ljk0YzE0LjI3LTM0LjY4LDI1LjQ1LTU1LjM4LDQwLjg0LTY3LjEzaC01MC42M2MtMzMsMC00OC42Nyw4LjM5LTQ4LjY3LDI1LjczczE5Ljg2LDEzLjk5LDE5Ljg2LDI5LjA5YzAsOC45NS02LjE1LDE2LjIyLTE1LjM4LDE2LjIyLTIzLjc3LDAtMzkuMTYtMjAuNy0zOS4xNi00My4wOCwwLTI4LjgxLDI0LjYxLTYxLjUzLDg1LjAzLTYxLjgxaDExNC42OGMxMi4zMSwwLDE3LjksNi40MywxNy45LDEzLjcxWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTc5NS4yMiwyMzQuMDRjLTIuOCw3LjI3LTUuNiwxMy45OS04LjY3LDIxLjI2LTE1LjY2LDM2LjkyLTM0LjQsNTQuMjYtNjYuMjksNTQuMjYtMjIuMSwwLTM5LjcyLTEzLjQzLTM5LjcyLTMyLjczLDAtOC42NywzLjkyLTE5LjU4LDE1LjY2LTQ4LjExbDkuNzktMjMuNzdjLjU2LTEuNjgsMS4xMi0yLjgsMS4xMi0zLjkyLDAtMy4wOC0xLjY4LTUuMDQtNC43Ni02LjQzbC0xOS4wMi04LjM5LTE5LjU4LDQ4Ljk1Yy0yLjI0LDYuMTUtNi45OSw4LjY3LTExLjc1LDguNjctNS44NywwLTExLjc1LTMuOTItMTEuNzUtMTAuOTEsMC0xLjY4LjI4LTMuMDgsMS4xMi01LjMyLDMuMDgtNy4yNywxMS4xOS0yNy42OSwyMC45OC01MS43NS04LjM5LTUuNTktMTIuNTktMTQuNTQtMTIuNTktMjMuNDksMC0xNy4wNiwxMi4wMy0yNS43MywyNC4wNS0yNS43MywxMy45OSwwLDIxLjgyLDEwLjYzLDIxLjgyLDIyLjk0LDAsMS4xMiwwLDIuMjQtLjI4LDMuNjRsMzguMDQsMTYuMjJjMTAuNjMsNC43NiwxNS45NCwxMS43NSwxNS45NCwyMC43LDAsMy42NC0uODQsNy41NS0yLjUyLDEyLjAzbC0xMC42MywyNi41N2MtNy44MywxOC40Ni0xMS40NywyOC4yNS0xMi44NywzMS42MS0zLjkyLDEwLjkxLjU2LDIwLjE0LDEwLjA3LDIwLjE0czIwLjctOC45NSwyOS4wOS0yOS4wOWMxLjY4LTMuNjQsNC40OC0xMC42MywxMC4zNS0yNC44OSwzLjM2LTcuODMsOC4zOS0xMC42MywxNS42Ni04LjM5LDcuMjcsMi4yNCw5Ljc5LDguMTEsNi43MSwxNS45NFoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im04NzAuNDYsMjM0LjA0Yy0yLjgsNy4yNy01LjU5LDEzLjk5LTguNjcsMjEuMjYtMTUuNjYsMzYuOTItMzQuNCw1NC4yNi02Ni4yOSw1NC4yNi0yMi4xLDAtMzkuNzItMTMuNDMtMzkuNzItMzIuNzMsMC04LjY3LDMuOTItMTkuNTgsMTUuNjYtNDguMTFsMjEuODItNTMuN2M1LjU5LTEzLjQzLDE0LjI2LTE5LjAyLDIyLjM4LTE5LjAyLDguNjcsMCwxNi4yMiw2Ljk5LDE2LjIyLDE3LjM0LDAsMy4zNi0uNTYsNi43MS0yLjI0LDEwLjYzbC0yLjUyLDYuMTUtMTUuNjYsMzguNmMtNy44MywxOC40Ni0xMS40NywyOC4yNS0xMi44NywzMS42MS0zLjkyLDEwLjkxLjU2LDIwLjE0LDEwLjA3LDIwLjE0czIwLjctOC45NSwyOS4wOS0yOS4wOWMxLjY4LTMuNjQsNC40OC0xMC42MywxMC4zNS0yNC44OSwzLjM2LTcuODMsOC4zOS0xMC42MywxNS42Ni04LjM5czkuNzksOC4xMSw2LjcxLDE1Ljk0Wm0tNTcuMzQtMTEyLjQ0YzAtMTIuMDMsOS41MS0yMS41NCwyMS4yNi0yMS41NHMyMS4yNiw5LjUxLDIxLjI2LDIxLjU0LTkuNTEsMjEuMjYtMjEuMjYsMjEuMjYtMjEuMjYtOS41MS0yMS4yNi0yMS4yNloiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im05NzUuMzUsMTcwLjI3YzAsNS41OS0zLjA4LDEyLjMxLTEwLjM1LDE4LjQ2bC0zNC42OCwyOC4yNSwyMi4xLDY0LjMzYy44NCwyLjgsMS4xMiw1LjMyLDEuMTIsNy41NSwwLDEyLjg3LTEwLjA3LDIwLjctMjAuMTQsMjAuNy03LjI3LDAtMTQuODMtNC40OC0xNy45LTEzLjk5bC0yNS40NS03NC45Ni0xOS4zLDQ3LjU1LTEwLjA3LDI0LjMzYy01LjA0LDEyLjMxLTEzLjk5LDE3LjA2LTIxLjgyLDE3LjA2LTguOTUsMC0xNi41LTUuODctMTYuNS0xNS45NCwwLTMuMDguNTYtNi4xNSwxLjk2LTkuNzlsNi40My0xNS42Niw3My4yOC0xODAuNDFjNS41OS0xMy40MywxNC4yNy0xOS4wMiwyMi4zOC0xOS4wMiw4LjY3LDAsMTYuMjIsNi45OSwxNi4yMiwxNy4zNCwwLDMuMzYtLjU2LDYuNzEtMi4yNCwxMC42M2wtMi41Miw2LjE1LTM4LjMyLDk0LjU0LDQyLjc5LTM0LjEyYzYuNDMtNS4wNCwxMi41OS03LjI3LDE3LjktNy4yNyw4Ljk1LDAsMTUuMSw2LjE1LDE1LjEsMTQuMjdaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJtMTEyOC4wNywyMzQuMDRsLTYuNzEsMTYuNWMtMTguMTgsNDYuNDMtNTQuNTQsNjAuOTgtODYuNzEsNjAuOTgtNDIuOCwwLTYzLjc3LTIyLjk0LTYzLjc3LTUzLjcsMC00Ni4xNSwzOS40NC0xMDMuNDksODUuODctMTAzLjc3LDI2LjU3LDAsMzkuNDQsMTUuOTQsMzkuNDQsMzMuNTYsMCwyMC40Mi0xNy42Miw0Mi44LTUxLjQ3LDQyLjhoLTI4LjUzYy0yLjUyLDguMTEtNC4yLDE2LjUtNC4yLDI0LjA1LDAsMTYuMjIsOS43OSwyNy45NywzMC4yMSwyNy45N3M0NS4wMy0xMC4wNyw1OC40Ni00My45MWw1LjA0LTEyLjAzYzMuMzYtNy44Myw4LjM5LTEwLjYzLDE1LjY2LTguMzksNy4yNywyLjI0LDkuNzksOC4xMSw2LjcxLDE1Ljk0Wm0tMTAxLjUzLTI2Ljg1aDE3LjYyYzE0LjI3LDAsMjEuNTQtNy44MywyMS41NC0xNC44MiwwLTUuMDQtMy4zNi05LjIzLTExLjQ3LTkuMjMtOC45NSwwLTE5LjMsMTAuMDctMjcuNjksMjQuMDVaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJtMzE2Ljg1LDIyNy43MWMwLTE2LjQ2LDguOTYtMzAuODEsMjIuMjYtMzguNDctNC45Mi0xMi40My0xMS0yMy44MS0xNy43OC0zNC4xN2gyMC4yOWM1Ljg0LDAsMTAuNTgtNC43NCwxMC41OC0xMC41OHMtNC43NC0xMC41OC0xMC41OC0xMC41OGgtMzYuMTdjLTI3LjEyLTMxLjg4LTU4Ljk4LTUxLjE0LTc0LjcxLTU5LjQxbC0xMC44OCwzOS43YzMyLjY3LDExLjc2LDU1LjgsNDMuNTUsNTQuNTQsODAuNTYtMS40NCw0Mi41My0zNS41NSw3Ny4zMy03OC4wNCw3OS41Ni00Ny42MSwyLjUxLTg3LjAyLTM1LjM2LTg3LjAyLTgyLjQ0czM2Ljk2LTgyLjU1LDgyLjU2LTgyLjU1YzMuMiwwLDYuMzYuMiw5LjQ3LjU2bDEwLjgxLTM5LjQzaC0zMC44N2MtNS4yNCwwLTkuNS00LjI1LTkuNS05LjVzNC4yNC05LjQ4LDkuNDctOS41bDE0MC45NS0uNHMtLjA2LS4wNS0uMDktLjA4aDI3LjM5YzUuODQsMCwxMC41OC00Ljc0LDEwLjU4LTEwLjU4cy00Ljc0LTEwLjU4LTEwLjU4LTEwLjU4aC01NC44N0MyNjQuNjMsMTAuNzMsMjI4Ljk0LS4yMywxOTAuNjYsMCw4NC44NS42NywwLDg2LjA4LDAsMTkxLjg5czg1LjkyLDE5MS44OSwxOTEuODksMTkxLjg5Yzc3LjQ2LDAsMTQ0LjItNDUuOTEsMTc0LjUxLTExMi0xLjcuMi0zLjQyLjMyLTUuMTguMzItMjQuNTEsMC00NC4zNy0xOS44Ny00NC4zNy00NC4zOFoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im0xODQuMTUsMTcyLjY2bDguMTktMjkuODVjLS4xNSwwLS4yOS0uMDEtLjQ0LS4wMS0yNy4xMSwwLTQ5LjA5LDIxLjk4LTQ5LjA5LDQ5LjA5czIxLjk4LDQ5LjA5LDQ5LjA5LDQ5LjA5LDQ5LjA5LTIxLjk4LDQ5LjA5LTQ5LjA5YzAtMjAuMzUtMTIuMzktMzcuODEtMzAuMDMtNDUuMjRsLTcuNzQsMjguMjNjMy41NSwzLjEsNS43OCw3LjY2LDUuNzgsMTIuNzQsMCw5LjM1LTcuNTgsMTYuOTItMTYuOTIsMTYuOTJzLTE2LjkyLTcuNTgtMTYuOTItMTYuOTJjMC02LjQ4LDMuNjUtMTIuMTIsOS0xNC45NVoiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im0zNzcuODgsMjE4LjJjLTMuMzYtNi4wNS05LjgyLTEwLjE0LTE3LjIzLTEwLjE0LTEwLjg4LDAtMTkuNyw4LjgzLTE5LjcsMTkuNzFzOC44MiwxOS43MSwxOS43LDE5LjcxYzguODksMCwxNi40My01LjksMTguODctMTQsLjA4LS4yNS4xNi0uNTIuMjItLjc4LjQzLTEuNTkuNjYtMy4yNy42Ni00Ljk5LDAtMy4wMi0uNzEtNS44OS0xLjk2LTguNDMtLjE4LS4zNy0uMzctLjczLS41Ny0xLjA5WiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTM5Ny42Miw3OS41NGgtODhjLTUuODQsMC0xMC41OCw0Ljc0LTEwLjU4LDEwLjU4czQuNzQsMTAuNTgsMTAuNTgsMTAuNThoODhjNS44NCwwLDEwLjU4LTQuNzQsMTAuNTgtMTAuNThzLTQuNzQtMTAuNTgtMTAuNTgtMTAuNThaIi8+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJtMzc2LjAzLDUwLjEyYzUuNywwLDEwLjMyLTQuNjIsMTAuMzItMTAuMzJzLTQuNjItMTAuMzItMTAuMzItMTAuMzItMTAuMzIsNC42Mi0xMC4zMiwxMC4zMiw0LjYyLDEwLjMyLDEwLjMyLDEwLjMyWiIvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTQyNS4wNiw4MC4wNmMtNS43LDAtMTAuMzIsNC42Mi0xMC4zMiwxMC4zMnM0LjYyLDEwLjMyLDEwLjMyLDEwLjMyLDEwLjMyLTQuNjIsMTAuMzItMTAuMzItNC42Mi0xMC4zMi0xMC4zMi0xMC4zMloiLz48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im0zNzAuMDksMTM1LjI4Yy01LjcsMC0xMC4zMiw0LjYyLTEwLjMyLDEwLjMyczQuNjIsMTAuMzIsMTAuMzIsMTAuMzIsMTAuMzItNC42MiwxMC4zMi0xMC4zMi00LjYyLTEwLjMyLTEwLjMyLTEwLjMyWiIvPjwvZz48L3N2Zz4=';

const defaultState = {
  rtoCoreChildren: [
    { name: 'Store Safety Basics', cost: 0, hours: 1.25 },
    { name: 'POS/Register Operations', cost: 0, hours: 1.25 },
    { name: 'Customer Service Standards', cost: 0, hours: 1.25 },
    { name: 'Age-Restricted Sales Policy', cost: 0, hours: 1.25 },
    { name: 'Fuel Pump & Dispenser Safety', cost: 0, hours: 1.25 }
  ],
  rtoTools: [
    { name: 'Course Authoring', cost: 5000 },
    { name: 'Knowledge Base/Wiki', cost: 3000 },
    { name: 'Video Hosting', cost: 2000 }
  ],
  trikeCoreChildren: [
    { name: 'Basic Store Safety (17 min)', cost: 0, hours: 0.28 },
    { name: 'Register Basics (14 min)', cost: 0, hours: 0.23 },
    { name: 'Workplace Standards (17 min)', cost: 0, hours: 0.28 },
    { name: 'Restricted Sales Overview (21 min)', cost: 0, hours: 0.35 },
    { name: 'Class C Fuel Safety (15 min)', cost: 0, hours: 0.25 }
  ]
};

const defaultInputs = {
  totalEmployees: 3275,
  avgHourlyRate: 17.00,
  frontlineTurnover: 120,
  storesNC: 75,
  storesSC: 60,
  storesTX: 50,
  storesMS: 45,
  storesAR: 10,
  rtoPlatformCost: 40.00,
  trikePlatformCost: 25.00,
  rtoTXTABCCost: 15,
  rtoTXTABCHours: 1.5,
  rtoTXFHCost: 15,
  rtoTXFHHours: 2.25,
  rtoSCFHCost: 12,
  rtoSCFHHours: 1.0,
  trikeTXTABCCost: 10,
  trikeTXTABCHours: 1.25,
  trikeTXFHCost: 10,
  trikeTXFHHours: 0.25,
  trikeSCFHCost: 10,
  trikeSCFHHours: 0.5
};

export default function Calculator() {
  const [state, setState] = useState(defaultState);
  const [inputs, setInputs] = useState(defaultInputs);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

  // Calculate total stores
  const totalStores = inputs.storesNC + inputs.storesSC + inputs.storesTX + inputs.storesMS + inputs.storesAR;

  // Calculate populations
  const calculatePopulations = useCallback(() => {
    const avgEmployeesPerStore = inputs.totalEmployees / totalStores;
    const frontlineTurnoverRate = inputs.frontlineTurnover / 100;

    // Both TX and SC use turnover rate (only train new hires)
    // Calculate full value first, then round to avoid rounding errors
    const txFrontlineTurnover = Math.round((avgEmployeesPerStore * inputs.storesTX) * frontlineTurnoverRate);
    const scFrontlineTurnover = Math.round((avgEmployeesPerStore * inputs.storesSC) * frontlineTurnoverRate);

    return {
      frontlineTurnoverTotal: Math.round(inputs.totalEmployees * frontlineTurnoverRate),
      txFrontlineTurnover: txFrontlineTurnover,
      scFrontlineTurnover: scFrontlineTurnover,
      totalEmployees: inputs.totalEmployees
    };
  }, [inputs, totalStores]);

  const pops = calculatePopulations();

  // Load data from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/calculator');
        const data = await response.json();

        if (data && !data.error && data.exists !== false) {
          if (data.state) {
            setState(data.state);
          }
          // Load all input values
          const newInputs = { ...defaultInputs };
          Object.keys(defaultInputs).forEach(key => {
            if (data[key] !== undefined) {
              newInputs[key] = parseFloat(data[key]) || defaultInputs[key];
            }
          });
          setInputs(newInputs);
          if (data.timestamp) {
            setLastSaved(new Date(data.timestamp));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fall back to localStorage if API fails
        const saved = localStorage.getItem('refuelCalculator');
        if (saved) {
          try {
            const data = JSON.parse(saved);
            if (data.state) setState(data.state);
            const newInputs = { ...defaultInputs };
            Object.keys(defaultInputs).forEach(key => {
              if (data[key] !== undefined) {
                newInputs[key] = parseFloat(data[key]) || defaultInputs[key];
              }
            });
            setInputs(newInputs);
          } catch (e) {
            console.error('Error loading from localStorage:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save calculation to API
  const saveCalculation = async () => {
    setSaveStatus('saving');

    const data = {
      state: JSON.parse(JSON.stringify(state)),
      ...inputs
    };

    try {
      const response = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus('saved');
        setLastSaved(new Date(result.timestamp));
        // Also save to localStorage as backup
        localStorage.setItem('refuelCalculator', JSON.stringify(data));
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving to API:', error);
      // Fall back to localStorage
      localStorage.setItem('refuelCalculator', JSON.stringify(data));
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!printRef.current) return;

    setExporting(true);

    try {
      const element = printRef.current;

      // Create canvas from the print-ready element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1100,
        windowHeight: element.scrollHeight
      });

      // Calculate dimensions - Letter size (8.5 x 11 inches)
      const imgWidth = 215.9; // mm (8.5 inches)
      const pageHeight = 279.4; // mm (11 inches)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      let heightLeft = imgHeight;
      let position = 0;
      const margin = 0;

      // Add first page
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        margin,
        position,
        imgWidth - (margin * 2),
        imgHeight
      );

      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          margin,
          position,
          imgWidth - (margin * 2),
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`Refuel-Training-Cost-Analysis-${date}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Toggle expandable row
  const toggleRow = (rowId) => {
    setExpandedRows(prev => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  // Update input
  const updateInput = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  // RTO Core Children handlers
  const updateRTOCoreChild = (idx, field, value) => {
    setState(prev => {
      const newChildren = [...prev.rtoCoreChildren];
      newChildren[idx] = { ...newChildren[idx], [field]: field === 'name' ? value : (parseFloat(value) || 0) };
      return { ...prev, rtoCoreChildren: newChildren };
    });
  };

  const addRTOCoreChild = () => {
    setState(prev => ({
      ...prev,
      rtoCoreChildren: [...prev.rtoCoreChildren, { name: 'New Course', cost: 0, hours: 0 }]
    }));
  };

  const removeRTOCoreChild = (idx) => {
    setState(prev => ({
      ...prev,
      rtoCoreChildren: prev.rtoCoreChildren.filter((_, i) => i !== idx)
    }));
  };

  // RTO Tools handlers
  const updateRTOTool = (idx, field, value) => {
    setState(prev => {
      const newTools = [...prev.rtoTools];
      newTools[idx] = { ...newTools[idx], [field]: field === 'name' ? value : (parseFloat(value) || 0) };
      return { ...prev, rtoTools: newTools };
    });
  };

  const addRTOTool = () => {
    setState(prev => ({
      ...prev,
      rtoTools: [...prev.rtoTools, { name: 'New Tool', cost: 0 }]
    }));
  };

  const removeRTOTool = (idx) => {
    setState(prev => ({
      ...prev,
      rtoTools: prev.rtoTools.filter((_, i) => i !== idx)
    }));
  };

  // Trike Core Children handlers
  const updateTrikeCoreChild = (idx, field, value) => {
    setState(prev => {
      const newChildren = [...prev.trikeCoreChildren];
      newChildren[idx] = { ...newChildren[idx], [field]: field === 'name' ? value : (parseFloat(value) || 0) };
      return { ...prev, trikeCoreChildren: newChildren };
    });
  };

  const addTrikeCoreChild = () => {
    setState(prev => ({
      ...prev,
      trikeCoreChildren: [...prev.trikeCoreChildren, { name: 'New Course', cost: 0, hours: 0 }]
    }));
  };

  const removeTrikeCoreChild = (idx) => {
    setState(prev => ({
      ...prev,
      trikeCoreChildren: prev.trikeCoreChildren.filter((_, i) => i !== idx)
    }));
  };

  // Format currency - round to whole dollars for values >= $100
  const formatCurrency = (value) => {
    if (Math.abs(value) >= 100) {
      return '$' + Math.round(value).toLocaleString('en-US');
    }
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate all values
  const rtoCoreTotal = state.rtoCoreChildren.reduce((sum, c) => sum + (c.cost || 0), 0);
  const rtoCoreHours = state.rtoCoreChildren.reduce((sum, c) => sum + (c.hours || 0), 0);
  const trikeCoreHours = state.trikeCoreChildren.reduce((sum, c) => sum + (c.hours || 0), 0);

  // RTO Calculations
  const rtoPlatformAnnual = inputs.rtoPlatformCost * totalStores * 12;
  const rtoCoreAnnualCost = state.rtoCoreChildren.reduce((sum, c) => sum + ((c.cost || 0) * pops.frontlineTurnoverTotal), 0);
  const rtoTXTABCCostTotal = inputs.rtoTXTABCCost * pops.txFrontlineTurnover;
  const rtoTXFHCostTotal = inputs.rtoTXFHCost * pops.txFrontlineTurnover;
  const rtoSCFHCostTotal = inputs.rtoSCFHCost * pops.scFrontlineTurnover;
  const rtoCoursesTotal = rtoCoreAnnualCost + rtoTXTABCCostTotal + rtoTXFHCostTotal + rtoSCFHCostTotal;
  const rtoToolsTotal = state.rtoTools.reduce((sum, t) => sum + (t.cost || 0), 0);
  const rtoGrandTotal = rtoPlatformAnnual + rtoCoursesTotal + rtoToolsTotal;

  // RTO Hours
  const rtoCoreHoursTotal = rtoCoreHours * pops.frontlineTurnoverTotal;
  const rtoTXTABCHoursTotal = inputs.rtoTXTABCHours * pops.txFrontlineTurnover;
  const rtoTXFHHoursTotal = inputs.rtoTXFHHours * pops.txFrontlineTurnover;
  const rtoSCFHHoursTotal = inputs.rtoSCFHHours * pops.scFrontlineTurnover;
  const rtoTotalHours = rtoCoreHoursTotal + rtoTXTABCHoursTotal + rtoTXFHHoursTotal + rtoSCFHHoursTotal;

  // Trike Calculations
  const trikePlatformAnnual = inputs.trikePlatformCost * totalStores * 12;
  const trikeTXTABCCostTotal = inputs.trikeTXTABCCost * pops.txFrontlineTurnover;
  const trikeTXFHCostTotal = inputs.trikeTXFHCost * pops.txFrontlineTurnover;
  const trikeSCFHCostTotal = inputs.trikeSCFHCost * pops.scFrontlineTurnover;
  const trikeCoursesTotal = trikeTXTABCCostTotal + trikeTXFHCostTotal + trikeSCFHCostTotal;
  const trikeGrandTotal = trikePlatformAnnual + trikeCoursesTotal;

  // Trike Hours
  const trikeCoreHoursTotal = trikeCoreHours * pops.frontlineTurnoverTotal;
  const trikeTXTABCHoursTotal = inputs.trikeTXTABCHours * pops.txFrontlineTurnover;
  const trikeTXFHHoursTotal = inputs.trikeTXFHHours * pops.txFrontlineTurnover;
  const trikeSCFHHoursTotal = inputs.trikeSCFHHours * pops.scFrontlineTurnover;
  const trikeTotalHours = trikeCoreHoursTotal + trikeTXTABCHoursTotal + trikeTXFHHoursTotal + trikeSCFHHoursTotal;

  // Savings
  const directSavings = rtoGrandTotal - trikeGrandTotal;
  const hoursSaved = rtoTotalHours - trikeTotalHours;
  const laborSavings = hoursSaved * inputs.avgHourlyRate;
  const totalSavingsValue = directSavings + laborSavings;
  const roiMultiple = trikeGrandTotal > 0 ? (totalSavingsValue / trikeGrandTotal).toFixed(1) : 0;

  // Calculate weighted average cert hours per employee based on state populations
  // TX employees: get TX TABC + TX Food Handler (turnover-based)
  // SC employees: get SC Food Handler (turnover-based)
  // NC/MS/AR employees: get 0 cert hours
  const txCertHoursRTO = inputs.rtoTXTABCHours + inputs.rtoTXFHHours;
  const scCertHoursRTO = inputs.rtoSCFHHours;
  const txCertHoursTrike = inputs.trikeTXTABCHours + inputs.trikeTXFHHours;
  const scCertHoursTrike = inputs.trikeSCFHHours;

  // Weighted average: (TX employees * TX hours + SC employees * SC hours) / total employees who need certs
  // Both TX and SC use turnover rate, so we can use frontlineTurnoverTotal as the denominator
  const rtoWeightedCertHours = pops.frontlineTurnoverTotal > 0
    ? ((pops.txFrontlineTurnover * txCertHoursRTO) + (pops.scFrontlineTurnover * scCertHoursRTO)) / pops.frontlineTurnoverTotal
    : 0;
  const trikeWeightedCertHours = pops.frontlineTurnoverTotal > 0
    ? ((pops.txFrontlineTurnover * txCertHoursTrike) + (pops.scFrontlineTurnover * scCertHoursTrike)) / pops.frontlineTurnoverTotal
    : 0;

  // Per-employee hours (using weighted averages for certs)
  const rtoHoursPerEmployee = rtoCoreHours + rtoWeightedCertHours;
  const trikeHoursPerEmployee = trikeCoreHours + trikeWeightedCertHours;

  // Chart calculations
  const maxCost = Math.max(rtoGrandTotal, trikeGrandTotal, 1);
  const maxHours = Math.max(rtoHoursPerEmployee, trikeHoursPerEmployee, 1);
  const timeSavingsPercent = rtoHoursPerEmployee > 0 ? Math.round(((rtoHoursPerEmployee - trikeHoursPerEmployee) / rtoHoursPerEmployee) * 100) : 0;

  // Labor section calculations (using weighted cert hours)
  const rtoCertHoursPerEmp = rtoWeightedCertHours;
  const trikeCertHoursPerEmp = trikeWeightedCertHours;
  const hoursSavedPerEmp = rtoHoursPerEmployee - trikeHoursPerEmployee;
  const timeReduction = rtoHoursPerEmployee > 0 ? Math.round((hoursSavedPerEmp / rtoHoursPerEmployee) * 100) : 0;
  const savingsPerEmployee = pops.frontlineTurnoverTotal > 0 ? laborSavings / pops.frontlineTurnoverTotal : 0;

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Top Header with Logo and Export */}
      <div className="top-header">
        <div className="top-header-left">
          <h1>Refuel Operating Company</h1>
          <p className="subtitle">Interactive Training Cost Calculator - RTO360 vs Trike</p>
        </div>
        <div className="top-header-right">
          <img src="/trike-logo.svg" alt="Trike" className="header-logo" />
          <button className="export-btn-secondary" onClick={exportToPDF} disabled={exporting}>
            {exporting ? 'Generating...' : 'Export to PDF'}
          </button>
        </div>
      </div>

      {/* Company Data */}
      <div className="section">
        <div className="section-header">
          <h2>Company & Employee Data</h2>
          <span className="badge">Inputs</span>
        </div>

        <div className="input-grid">
          <div className="input-group">
            <label>Total Stores <span style={{fontSize: '11px', color: '#ff6b35'}}>(auto-calculated)</span></label>
            <input type="number" value={totalStores} readOnly />
          </div>
          <div className="input-group">
            <label>Total Employees</label>
            <input type="number" value={inputs.totalEmployees} onChange={(e) => updateInput('totalEmployees', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Average Hourly Rate</label>
            <div className="currency-wrapper">
              <input type="number" step="0.01" value={inputs.avgHourlyRate} onChange={(e) => updateInput('avgHourlyRate', e.target.value)} />
            </div>
          </div>
          <div className="input-group">
            <label>Frontline Turnover (%)</label>
            <input type="number" step="1" value={inputs.frontlineTurnover} onChange={(e) => updateInput('frontlineTurnover', e.target.value)} />
          </div>
        </div>

        <h3 className="subsection-header">Store Count by State</h3>
        <div className="input-grid">
          <div className="input-group">
            <label>North Carolina Stores</label>
            <input type="number" value={inputs.storesNC} onChange={(e) => updateInput('storesNC', e.target.value)} />
          </div>
          <div className="input-group">
            <label>South Carolina Stores</label>
            <input type="number" value={inputs.storesSC} onChange={(e) => updateInput('storesSC', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Texas Stores</label>
            <input type="number" value={inputs.storesTX} onChange={(e) => updateInput('storesTX', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Mississippi Stores</label>
            <input type="number" value={inputs.storesMS} onChange={(e) => updateInput('storesMS', e.target.value)} />
          </div>
          <div className="input-group">
            <label>Arkansas Stores</label>
            <input type="number" value={inputs.storesAR} onChange={(e) => updateInput('storesAR', e.target.value)} />
          </div>
        </div>
      </div>

      {/* RTO360 Section */}
      <div className="section">
        <div className="section-header">
          <h2>Current RTO360 Costs</h2>
          <span className="badge">Provider</span>
        </div>

        <div className="input-grid">
          <div className="input-group">
            <label>Platform Cost (per store/month)</label>
            <div className="currency-wrapper">
              <input type="number" step="0.01" value={inputs.rtoPlatformCost} onChange={(e) => updateInput('rtoPlatformCost', e.target.value)} />
            </div>
          </div>
        </div>

        <h3 className="subsection-header">Training Costs & Time</h3>
        <table className="course-table">
          <thead>
            <tr>
              <th style={{width: '30%'}}>Course</th>
              <th style={{width: '18%'}}>Population</th>
              <th style={{width: '13%'}}>Annual Turnover</th>
              <th style={{width: '13%'}}>$/Seat</th>
              <th style={{width: '13%'}}>Hrs/Employee</th>
              <th style={{width: '13%'}}></th>
            </tr>
          </thead>
          <tbody>
            <tr className="expandable-row" onClick={() => toggleRow('rtoCore')}>
              <td><span className={`toggle-icon ${expandedRows.rtoCore ? 'expanded' : ''}`}>▶</span> Core Onboarding</td>
              <td style={{fontSize: '12px', color: '#888'}}>Frontline Turnover</td>
              <td>{pops.frontlineTurnoverTotal}</td>
              <td><div className="currency-wrapper"><input type="number" value={rtoCoreTotal.toFixed(2)} readOnly /></div></td>
              <td><input type="number" value={rtoCoreHours.toFixed(2)} readOnly /></td>
              <td></td>
            </tr>
            {state.rtoCoreChildren.map((child, idx) => (
              <tr key={idx} className={`child-row ${expandedRows.rtoCore ? 'visible' : ''}`}>
                <td colSpan="3">
                  <input type="text" value={child.name} onChange={(e) => updateRTOCoreChild(idx, 'name', e.target.value)} style={{width: '100%'}} />
                </td>
                <td>
                  <div className="currency-wrapper">
                    <input type="number" step="0.01" value={child.cost} onChange={(e) => updateRTOCoreChild(idx, 'cost', e.target.value)} />
                  </div>
                </td>
                <td>
                  <input type="number" step="0.01" value={child.hours} onChange={(e) => updateRTOCoreChild(idx, 'hours', e.target.value)} />
                </td>
                <td>
                  <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeRTOCoreChild(idx); }}>×</button>
                </td>
              </tr>
            ))}
            <tr className={`child-row add-core-row ${expandedRows.rtoCore ? 'visible' : ''}`}>
              <td colSpan="6">
                <button className="add-row-btn" onClick={(e) => { e.stopPropagation(); addRTOCoreChild(); }}>+ Add Core Course</button>
              </td>
            </tr>
            <tr>
              <td>TX TABC</td>
              <td style={{fontSize: '12px', color: '#888'}}>TX Frontline Turnover</td>
              <td>{pops.txFrontlineTurnover}</td>
              <td><div className="currency-wrapper"><input type="number" step="0.01" value={inputs.rtoTXTABCCost} onChange={(e) => updateInput('rtoTXTABCCost', e.target.value)} /></div></td>
              <td><input type="number" step="0.1" value={inputs.rtoTXTABCHours} onChange={(e) => updateInput('rtoTXTABCHours', e.target.value)} /></td>
              <td></td>
            </tr>
            <tr>
              <td>TX Food Handler</td>
              <td style={{fontSize: '12px', color: '#888'}}>TX Frontline Turnover</td>
              <td>{pops.txFrontlineTurnover}</td>
              <td><div className="currency-wrapper"><input type="number" step="0.01" value={inputs.rtoTXFHCost} onChange={(e) => updateInput('rtoTXFHCost', e.target.value)} /></div></td>
              <td><input type="number" step="0.1" value={inputs.rtoTXFHHours} onChange={(e) => updateInput('rtoTXFHHours', e.target.value)} /></td>
              <td></td>
            </tr>
            <tr>
              <td>SC Food Handler</td>
              <td style={{fontSize: '12px', color: '#888'}}>SC Frontline Turnover</td>
              <td>{pops.scFrontlineTurnover}</td>
              <td><div className="currency-wrapper"><input type="number" step="0.01" value={inputs.rtoSCFHCost} onChange={(e) => updateInput('rtoSCFHCost', e.target.value)} /></div></td>
              <td><input type="number" step="0.1" value={inputs.rtoSCFHHours} onChange={(e) => updateInput('rtoSCFHHours', e.target.value)} /></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <h3 className="subsection-header">Additional Costs & Tools</h3>
        <table className="course-table">
          <thead>
            <tr>
              <th style={{width: '60%'}}>Item Name</th>
              <th style={{width: '30%'}}>Annual Cost</th>
              <th style={{width: '10%'}}></th>
            </tr>
          </thead>
          <tbody>
            <tr className="expandable-row" onClick={() => toggleRow('rtoTools')}>
              <td><span className={`toggle-icon ${expandedRows.rtoTools ? 'expanded' : ''}`}>▶</span> Additional Costs</td>
              <td><div className="currency-wrapper"><input type="number" value={rtoToolsTotal} readOnly /></div></td>
              <td></td>
            </tr>
            {state.rtoTools.map((tool, idx) => (
              <tr key={idx} className={`child-row ${expandedRows.rtoTools ? 'visible' : ''}`}>
                <td>
                  <input type="text" value={tool.name} onChange={(e) => updateRTOTool(idx, 'name', e.target.value)} />
                </td>
                <td>
                  <div className="currency-wrapper">
                    <input type="number" step="1" value={tool.cost} onChange={(e) => updateRTOTool(idx, 'cost', e.target.value)} />
                  </div>
                </td>
                <td>
                  <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeRTOTool(idx); }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-row-btn" onClick={addRTOTool}>+ Add Item</button>
      </div>

      {/* Trike Section */}
      <div className="section">
        <div className="section-header">
          <h2>Trike Proposal</h2>
          <span className="badge green">Proposed</span>
        </div>

        <div className="input-grid">
          <div className="input-group">
            <label>Platform Cost (per store/month)</label>
            <div className="currency-wrapper">
              <input type="number" step="0.01" value={inputs.trikePlatformCost} onChange={(e) => updateInput('trikePlatformCost', e.target.value)} />
            </div>
          </div>
        </div>

        <h3 className="subsection-header">Core Training & State Certifications</h3>
        <table className="course-table">
          <thead>
            <tr>
              <th style={{width: '30%'}}>Training</th>
              <th style={{width: '18%'}}>Population</th>
              <th style={{width: '13%'}}>Annual Turnover</th>
              <th style={{width: '13%'}}>$/Seat</th>
              <th style={{width: '13%'}}>Hrs/Employee</th>
              <th style={{width: '13%'}}></th>
            </tr>
          </thead>
          <tbody>
            <tr className="expandable-row" onClick={() => toggleRow('trikeCore')}>
              <td><span className={`toggle-icon ${expandedRows.trikeCore ? 'expanded' : ''}`}>▶</span> Core Onboarding</td>
              <td style={{fontSize: '12px', color: '#888'}}>Frontline Turnover</td>
              <td>{pops.frontlineTurnoverTotal}</td>
              <td><span className="included-badge">Included</span></td>
              <td><input type="number" value={trikeCoreHours.toFixed(2)} readOnly /></td>
              <td></td>
            </tr>
            {state.trikeCoreChildren.map((child, idx) => (
              <tr key={idx} className={`child-row ${expandedRows.trikeCore ? 'visible' : ''}`}>
                <td colSpan="3">
                  <input type="text" value={child.name} onChange={(e) => updateTrikeCoreChild(idx, 'name', e.target.value)} style={{width: '100%'}} />
                </td>
                <td><span className="included-badge">Included</span></td>
                <td>
                  <input type="number" step="0.01" value={child.hours} onChange={(e) => updateTrikeCoreChild(idx, 'hours', e.target.value)} />
                </td>
                <td>
                  <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeTrikeCoreChild(idx); }}>×</button>
                </td>
              </tr>
            ))}
            <tr className={`child-row add-core-row ${expandedRows.trikeCore ? 'visible' : ''}`}>
              <td colSpan="6">
                <button className="add-row-btn" onClick={(e) => { e.stopPropagation(); addTrikeCoreChild(); }}>+ Add Core Course</button>
              </td>
            </tr>
            <tr>
              <td>TX TABC (incremental)</td>
              <td style={{fontSize: '12px', color: '#888'}}>TX Frontline Turnover</td>
              <td>{pops.txFrontlineTurnover}</td>
              <td><div className="currency-wrapper"><input type="number" step="0.01" value={inputs.trikeTXTABCCost} onChange={(e) => updateInput('trikeTXTABCCost', e.target.value)} /></div></td>
              <td><input type="number" step="0.1" value={inputs.trikeTXTABCHours} onChange={(e) => updateInput('trikeTXTABCHours', e.target.value)} /></td>
              <td></td>
            </tr>
            <tr>
              <td>TX Food Handler (incremental)</td>
              <td style={{fontSize: '12px', color: '#888'}}>TX Frontline Turnover</td>
              <td>{pops.txFrontlineTurnover}</td>
              <td><div className="currency-wrapper"><input type="number" step="0.01" value={inputs.trikeTXFHCost} onChange={(e) => updateInput('trikeTXFHCost', e.target.value)} /></div></td>
              <td><input type="number" step="0.1" value={inputs.trikeTXFHHours} onChange={(e) => updateInput('trikeTXFHHours', e.target.value)} /></td>
              <td></td>
            </tr>
            <tr>
              <td>SC Food Handler (incremental)</td>
              <td style={{fontSize: '12px', color: '#888'}}>SC Frontline Turnover</td>
              <td>{pops.scFrontlineTurnover}</td>
              <td><div className="currency-wrapper"><input type="number" step="0.01" value={inputs.trikeSCFHCost} onChange={(e) => updateInput('trikeSCFHCost', e.target.value)} /></div></td>
              <td><input type="number" step="0.1" value={inputs.trikeSCFHHours} onChange={(e) => updateInput('trikeSCFHHours', e.target.value)} /></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div className="note">
          <strong>Time Calculation:</strong> State certification times show incremental hours beyond Core overlap. For example, if Core includes 15min of Alcohol sales training and TX TABC is 90min total, only the additional 75min is counted.
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="section charts-section">
        <div className="section-header">
          <h2>Summary Analytics</h2>
        </div>

        <div className="charts-grid">
          {/* Annual Cost Comparison */}
          <div className="chart-card">
            <h4>Annual Platform & Training Costs</h4>
            <div className="h-bar-chart">
              <div className="h-bar-row">
                <div className="h-bar-header">
                  <span className="h-bar-label">RTO360 (Current)</span>
                  <span className="h-bar-value">{formatCurrency(rtoGrandTotal)}</span>
                </div>
                <div className="h-bar-track">
                  <div className="h-bar-fill rto" style={{width: '100%'}}></div>
                </div>
              </div>
              <div className="h-bar-row">
                <div className="h-bar-header">
                  <span className="h-bar-label">Trike (Proposed)</span>
                  <span className="h-bar-value" style={{color: '#ff6b35'}}>{formatCurrency(trikeGrandTotal)}</span>
                </div>
                <div className="h-bar-track">
                  <div className="h-bar-fill trike" style={{width: `${(trikeGrandTotal / maxCost) * 100}%`}}></div>
                </div>
              </div>
            </div>
            <div className="chart-footer">
              <div className="chart-footer-stat">{formatCurrency(directSavings)}</div>
              <div className="chart-footer-label">Annual Cost Savings</div>
            </div>
          </div>

          {/* Training Time Comparison */}
          <div className="chart-card">
            <h4>Training Time per Employee</h4>
            <div className="h-bar-chart">
              <div className="h-bar-row">
                <div className="h-bar-header">
                  <span className="h-bar-label">RTO360 (Current)</span>
                  <span className="h-bar-value">{rtoHoursPerEmployee.toFixed(1)} hrs</span>
                </div>
                <div className="h-bar-track">
                  <div className="h-bar-fill rto" style={{width: '100%'}}></div>
                </div>
              </div>
              <div className="h-bar-row">
                <div className="h-bar-header">
                  <span className="h-bar-label">Trike (Proposed)</span>
                  <span className="h-bar-value" style={{color: '#ff6b35'}}>{trikeHoursPerEmployee.toFixed(1)} hrs</span>
                </div>
                <div className="h-bar-track">
                  <div className="h-bar-fill trike" style={{width: `${(trikeHoursPerEmployee / maxHours) * 100}%`}}></div>
                </div>
              </div>
            </div>
            <div className="chart-footer">
              <div className="chart-footer-stat">{timeSavingsPercent}%</div>
              <div className="chart-footer-label">Time Reduction</div>
            </div>
          </div>

          {/* Savings Breakdown */}
          <div className="chart-card">
            <h4>Total Value Delivered</h4>
            <div className="savings-list">
              <div className="savings-row">
                <span className="savings-row-label">
                  <span className="indicator direct"></span>
                  Direct Cost Savings
                </span>
                <span className="savings-row-value">{formatCurrency(directSavings)}</span>
              </div>
              <div className="savings-row">
                <span className="savings-row-label">
                  <span className="indicator labor"></span>
                  Labor Recapture Value
                </span>
                <span className="savings-row-value">{formatCurrency(laborSavings)}</span>
              </div>
              <div className="savings-row">
                <span className="savings-row-label">
                  <span className="indicator total"></span>
                  Total Annual Value
                </span>
                <span className="savings-row-value total">{formatCurrency(totalSavingsValue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Labor Cost Comparison */}
      <div className="section labor-section">
        <div className="section-header">
          <h2>Labor Cost Comparison</h2>
          <span className="badge green">Biggest Impact</span>
        </div>

        <div className="labor-grid">
          {/* RTO360 Labor Costs */}
          <div className="labor-card">
            <h4>RTO360 Labor Costs <span className="badge-small current">Current</span></h4>

            <div className="labor-calc-row">
              <span className="labor-calc-label">Core Training Hours/Employee</span>
              <span className="labor-calc-value">{rtoCoreHours.toFixed(2)} hrs</span>
            </div>
            <div className="labor-calc-row">
              <span className="labor-calc-label">+ Avg State Cert Hours/Employee</span>
              <span className="labor-calc-value">{rtoCertHoursPerEmp.toFixed(2)} hrs</span>
            </div>
            <div className="labor-calc-row">
              <span className="labor-calc-label">= Avg Total Hours/Employee</span>
              <span className="labor-calc-value highlight">{rtoHoursPerEmployee.toFixed(2)} hrs</span>
            </div>

            <div className="labor-calc-row formula">
              <span className="labor-calc-label formula-text">× Employees Trained Annually</span>
              <span className="labor-calc-value">{pops.frontlineTurnoverTotal.toLocaleString()}</span>
            </div>

            <div className="labor-calc-row">
              <span className="labor-calc-label">= Total Training Hours</span>
              <span className="labor-calc-value">{Math.round(rtoTotalHours).toLocaleString()} hrs</span>
            </div>

            <div className="labor-calc-row formula">
              <span className="labor-calc-label formula-text">× Hourly Rate</span>
              <span className="labor-calc-value">${inputs.avgHourlyRate.toFixed(2)}</span>
            </div>

            <div className="labor-calc-row total">
              <span className="labor-calc-label">Annual Labor Cost</span>
              <span className="labor-calc-value total">{formatCurrency(rtoTotalHours * inputs.avgHourlyRate)}</span>
            </div>
          </div>

          {/* Trike Labor Costs */}
          <div className="labor-card">
            <h4>Trike Labor Costs <span className="badge-small proposed">Proposed</span></h4>

            <div className="labor-calc-row">
              <span className="labor-calc-label">Core Training Hours/Employee</span>
              <span className="labor-calc-value">{trikeCoreHours.toFixed(2)} hrs</span>
            </div>
            <div className="labor-calc-row">
              <span className="labor-calc-label">+ Avg State Cert Hours/Employee</span>
              <span className="labor-calc-value">{trikeCertHoursPerEmp.toFixed(2)} hrs</span>
            </div>
            <div className="labor-calc-row">
              <span className="labor-calc-label">= Avg Total Hours/Employee</span>
              <span className="labor-calc-value highlight">{trikeHoursPerEmployee.toFixed(2)} hrs</span>
            </div>

            <div className="labor-calc-row formula">
              <span className="labor-calc-label formula-text">× Employees Trained Annually</span>
              <span className="labor-calc-value">{pops.frontlineTurnoverTotal.toLocaleString()}</span>
            </div>

            <div className="labor-calc-row">
              <span className="labor-calc-label">= Total Training Hours</span>
              <span className="labor-calc-value">{Math.round(trikeTotalHours).toLocaleString()} hrs</span>
            </div>

            <div className="labor-calc-row formula">
              <span className="labor-calc-label formula-text">× Hourly Rate</span>
              <span className="labor-calc-value">${inputs.avgHourlyRate.toFixed(2)}</span>
            </div>

            <div className="labor-calc-row total">
              <span className="labor-calc-label">Annual Labor Cost</span>
              <span className="labor-calc-value total highlight">{formatCurrency(trikeTotalHours * inputs.avgHourlyRate)}</span>
            </div>
          </div>

          {/* Comparison / Savings */}
          <div className="labor-card comparison">
            <h4>Labor Savings <span className="badge-small savings">Impact</span></h4>

            <div className="labor-big-number">
              <div className="number">{formatCurrency(laborSavings)}</div>
              <div className="label">Annual Labor Recapture</div>
            </div>

            <div className="labor-calc-row">
              <span className="labor-calc-label">Avg Hours Saved/Employee</span>
              <span className="labor-calc-value success">{hoursSavedPerEmp.toFixed(2)} hrs</span>
            </div>
            <div className="labor-calc-row">
              <span className="labor-calc-label">Total Hours Saved</span>
              <span className="labor-calc-value success">{Math.round(hoursSaved).toLocaleString()} hrs</span>
            </div>
            <div className="labor-calc-row">
              <span className="labor-calc-label">Time Reduction</span>
              <span className="labor-calc-value success">{timeReduction}%</span>
            </div>

            <div className="comparison-highlight">
              <div className="stat">${Math.round(savingsPerEmployee)}/employee</div>
              <div className="desc">Labor cost saved per employee trained</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="section">
        <div className="section-header">
          <h2>Cost Comparison</h2>
        </div>

        <div className="comparison-grid">
          <div className="comparison-card">
            <h3>RTO360 (Current)</h3>
            <div className="cost-line">
              <span className="cost-label">Platform</span>
              <span className="cost-value">{formatCurrency(rtoPlatformAnnual)}</span>
            </div>
            <div className="cost-line">
              <span className="cost-label">Training Costs</span>
              <span className="cost-value">{formatCurrency(rtoCoursesTotal)}</span>
            </div>
            <div className="cost-line">
              <span className="cost-label">Additional Costs</span>
              <span className="cost-value">{formatCurrency(rtoToolsTotal)}</span>
            </div>
            <div className="cost-line total">
              <span className="cost-label">Annual Total</span>
              <span className="cost-value">{formatCurrency(rtoGrandTotal)}</span>
            </div>
          </div>

          <div className="comparison-card highlight">
            <h3>Trike (Proposed)</h3>
            <div className="cost-line">
              <span className="cost-label">Platform</span>
              <span className="cost-value">{formatCurrency(trikePlatformAnnual)}</span>
            </div>
            <div className="cost-line">
              <span className="cost-label">Certification Costs</span>
              <span className="cost-value">{formatCurrency(trikeCoursesTotal)}</span>
            </div>
            <div className="cost-line">
              <span className="cost-label">Capabilities</span>
              <span className="cost-value" style={{color: '#10b981'}}>Included</span>
            </div>
            <div className="cost-line total">
              <span className="cost-label">Annual Total</span>
              <span className="cost-value">{formatCurrency(trikeGrandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Banner */}
      <div className="savings-banner">
        <h2>Total Annual Savings</h2>
        <div className="amount">{formatCurrency(totalSavingsValue)}</div>

        <div className="savings-grid">
          <div className="savings-item">
            <div className="savings-item-label">Direct Cost Savings</div>
            <div className="savings-item-value">{formatCurrency(directSavings)}</div>
          </div>
          <div className="savings-item">
            <div className="savings-item-label">Labor Recapture</div>
            <div className="savings-item-value">{formatCurrency(laborSavings)}</div>
          </div>
          <div className="savings-item">
            <div className="savings-item-label">ROI Multiple</div>
            <div className="savings-item-value">{roiMultiple}x</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        {saveStatus && (
          <span className={`save-status ${saveStatus}`}>
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved!'}
            {saveStatus === 'error' && 'Error saving'}
          </span>
        )}
        {lastSaved && !saveStatus && (
          <span className="save-status">
            Last saved: {lastSaved.toLocaleString()}
          </span>
        )}
        <button className="secondary" onClick={exportToPDF} disabled={exporting}>
          {exporting ? 'Generating PDF...' : 'Export to PDF'}
        </button>
        <button className="primary" onClick={saveCalculation}>
          Save Changes
        </button>
      </div>

      {/* Hidden Print-Ready Component for PDF Export */}
      <div className="print-container" ref={printRef}>
        <div className="print-page">
          {/* Header with Logo */}
          <div className="print-header">
            <div className="print-header-left">
              <h1 className="print-title">Training Cost Analysis</h1>
              <p className="print-subtitle">Refuel Operating Company</p>
              <p className="print-date">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="print-header-right">
              <img src={TRIKE_LOGO_BASE64} alt="Trike" className="print-logo" />
            </div>
          </div>

          {/* Executive Summary */}
          <div className="print-summary-banner">
            <div className="print-summary-main">
              <div className="print-summary-label">Total Annual Value</div>
              <div className="print-summary-value">{formatCurrency(totalSavingsValue)}</div>
            </div>
            <div className="print-summary-breakdown">
              <div className="print-summary-item">
                <span className="label">Direct Savings</span>
                <span className="value">{formatCurrency(directSavings)}</span>
              </div>
              <div className="print-summary-item">
                <span className="label">Labor Recapture</span>
                <span className="value">{formatCurrency(laborSavings)}</span>
              </div>
              <div className="print-summary-item">
                <span className="label">ROI Multiple</span>
                <span className="value">{roiMultiple}x</span>
              </div>
            </div>
          </div>

          {/* Compact Org Info - Single Line */}
          <div className="print-org-summary">
            <span><strong>{totalStores}</strong> Stores</span>
            <span className="divider">|</span>
            <span><strong>{inputs.totalEmployees.toLocaleString()}</strong> Employees</span>
            <span className="divider">|</span>
            <span><strong>{inputs.frontlineTurnover}%</strong> Annual Turnover</span>
            <span className="divider">|</span>
            <span><strong>{pops.frontlineTurnoverTotal.toLocaleString()}</strong> Trained/Year</span>
          </div>

          {/* Cost Comparison */}
          <div className="print-section">
            <h2 className="print-section-title">Annual Cost Comparison</h2>
            <div className="print-comparison-table">
              <div className="print-comparison-header">
                <span></span>
                <span>RTO360 (Current)</span>
                <span>Trike (Proposed)</span>
                <span>Savings</span>
              </div>
              <div className="print-comparison-row">
                <span className="label">Platform Costs</span>
                <span>{formatCurrency(rtoPlatformAnnual)}</span>
                <span>{formatCurrency(trikePlatformAnnual)}</span>
                <span className="savings">{formatCurrency(rtoPlatformAnnual - trikePlatformAnnual)}</span>
              </div>
              <div className="print-comparison-row">
                <span className="label">Training/Certification</span>
                <span>{formatCurrency(rtoCoursesTotal)}</span>
                <span>{formatCurrency(trikeCoursesTotal)}</span>
                <span className="savings">{formatCurrency(rtoCoursesTotal - trikeCoursesTotal)}</span>
              </div>
              <div className="print-comparison-row">
                <span className="label">Additional Tools</span>
                <span>{formatCurrency(rtoToolsTotal)}</span>
                <span className="included">Included</span>
                <span className="savings">{formatCurrency(rtoToolsTotal)}</span>
              </div>
              <div className="print-comparison-row total">
                <span className="label">Annual Total</span>
                <span>{formatCurrency(rtoGrandTotal)}</span>
                <span className="highlight">{formatCurrency(trikeGrandTotal)}</span>
                <span className="savings highlight">{formatCurrency(directSavings)}</span>
              </div>
            </div>
          </div>

          {/* Labor Impact */}
          <div className="print-section">
            <h2 className="print-section-title">Labor Cost Impact</h2>
            <div className="print-labor-grid">
              <div className="print-labor-card">
                <h3>RTO360 (Current)</h3>
                <div className="print-labor-row">
                  <span>Training Time/Employee</span>
                  <span>{rtoHoursPerEmployee.toFixed(2)} hrs</span>
                </div>
                <div className="print-labor-row">
                  <span>Total Training Hours</span>
                  <span>{Math.round(rtoTotalHours).toLocaleString()} hrs</span>
                </div>
                <div className="print-labor-row total">
                  <span>Annual Labor Cost</span>
                  <span>{formatCurrency(rtoTotalHours * inputs.avgHourlyRate)}</span>
                </div>
              </div>
              <div className="print-labor-card highlight">
                <h3>Trike (Proposed)</h3>
                <div className="print-labor-row">
                  <span>Training Time/Employee</span>
                  <span>{trikeHoursPerEmployee.toFixed(2)} hrs</span>
                </div>
                <div className="print-labor-row">
                  <span>Total Training Hours</span>
                  <span>{Math.round(trikeTotalHours).toLocaleString()} hrs</span>
                </div>
                <div className="print-labor-row total">
                  <span>Annual Labor Cost</span>
                  <span>{formatCurrency(trikeTotalHours * inputs.avgHourlyRate)}</span>
                </div>
              </div>
              <div className="print-labor-card savings">
                <h3>Savings</h3>
                <div className="print-labor-row">
                  <span>Time Reduction</span>
                  <span>{timeReduction}%</span>
                </div>
                <div className="print-labor-row">
                  <span>Hours Saved/Year</span>
                  <span>{Math.round(hoursSaved).toLocaleString()} hrs</span>
                </div>
                <div className="print-labor-row total">
                  <span>Labor Recapture</span>
                  <span>{formatCurrency(laborSavings)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Training Breakdown */}
          <div className="print-section">
            <h2 className="print-section-title">Training Program Details</h2>
            <div className="print-training-table">
              <div className="print-training-header">
                <span>Training Component</span>
                <span>Population</span>
                <span>RTO360</span>
                <span>Trike</span>
                <span>Saved</span>
              </div>
              <div className="print-training-row">
                <span>Core Onboarding</span>
                <span>{pops.frontlineTurnoverTotal.toLocaleString()}</span>
                <span>{rtoCoreHours.toFixed(2)} hrs</span>
                <span>{trikeCoreHours.toFixed(2)} hrs</span>
                <span className="savings">{(rtoCoreHours - trikeCoreHours).toFixed(2)} hrs</span>
              </div>
              <div className="print-training-row">
                <span>TX TABC Certification</span>
                <span>{pops.txFrontlineTurnover.toLocaleString()}</span>
                <span>{inputs.rtoTXTABCHours} hrs</span>
                <span>{inputs.trikeTXTABCHours} hrs</span>
                <span className="savings">{(inputs.rtoTXTABCHours - inputs.trikeTXTABCHours).toFixed(2)} hrs</span>
              </div>
              <div className="print-training-row">
                <span>TX Food Handler</span>
                <span>{pops.txFrontlineTurnover.toLocaleString()}</span>
                <span>{inputs.rtoTXFHHours} hrs</span>
                <span>{inputs.trikeTXFHHours} hrs</span>
                <span className="savings">{(inputs.rtoTXFHHours - inputs.trikeTXFHHours).toFixed(2)} hrs</span>
              </div>
              <div className="print-training-row">
                <span>SC Food Handler</span>
                <span>{pops.scFrontlineTurnover.toLocaleString()}</span>
                <span>{inputs.rtoSCFHHours} hrs</span>
                <span>{inputs.trikeSCFHHours} hrs</span>
                <span className="savings">{(inputs.rtoSCFHHours - inputs.trikeSCFHHours).toFixed(2)} hrs</span>
              </div>
            </div>
          </div>

          {/* PAGE 2 - Visual Charts */}
          <div className="print-page-break"></div>

          {/* Page 2 Header */}
          <div className="print-header-small">
            <span className="print-header-small-title">Training Cost Analysis — Refuel Operating Company</span>
            <img src={TRIKE_LOGO_BASE64} alt="Trike" className="print-logo-small" />
          </div>

          {/* Total Cost Comparison Visual */}
          <div className="print-section">
            <h2 className="print-section-title">Total Annual Cost Comparison</h2>
            <div className="print-chart-container">
              <div className="print-bar-chart">
                <div className="print-bar-row">
                  <div className="print-bar-label">
                    <span className="name">RTO360 (Current)</span>
                    <span className="amount">{formatCurrency(rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))}</span>
                  </div>
                  <div className="print-bar-track">
                    <div className="print-bar rto" style={{width: '100%'}}></div>
                  </div>
                </div>
                <div className="print-bar-row">
                  <div className="print-bar-label">
                    <span className="name">Trike (Proposed)</span>
                    <span className="amount">{formatCurrency(trikeGrandTotal + (trikeTotalHours * inputs.avgHourlyRate))}</span>
                  </div>
                  <div className="print-bar-track">
                    <div className="print-bar trike" style={{width: `${((trikeGrandTotal + (trikeTotalHours * inputs.avgHourlyRate)) / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 100}%`}}></div>
                  </div>
                </div>
              </div>
              <div className="print-chart-legend">
                <div className="legend-item"><span className="dot platform"></span> Platform & Training Costs</div>
                <div className="legend-item"><span className="dot labor"></span> Labor Costs (Training Time)</div>
              </div>
            </div>
          </div>

          {/* Stacked Cost Breakdown */}
          <div className="print-section">
            <h2 className="print-section-title">Cost Breakdown by Category</h2>
            <div className="print-stacked-chart">
              <div className="print-stacked-row">
                <div className="print-stacked-label">RTO360</div>
                <div className="print-stacked-bars">
                  <div className="print-stacked-segment platform" style={{width: `${(rtoPlatformAnnual / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 100}%`}}>
                    <span className="segment-label">Platform</span>
                  </div>
                  <div className="print-stacked-segment training" style={{width: `${(rtoCoursesTotal / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 100}%`}}>
                    <span className="segment-label">Training</span>
                  </div>
                  <div className="print-stacked-segment tools" style={{width: `${(rtoToolsTotal / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 100}%`}}>
                    <span className="segment-label">Tools</span>
                  </div>
                  <div className="print-stacked-segment labor" style={{width: `${((rtoTotalHours * inputs.avgHourlyRate) / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 100}%`}}>
                    <span className="segment-label">Labor</span>
                  </div>
                </div>
                <div className="print-stacked-total">{formatCurrency(rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))}</div>
              </div>
              <div className="print-stacked-row">
                <div className="print-stacked-label">Trike</div>
                <div className="print-stacked-bars">
                  <div className="print-stacked-segment platform" style={{width: `${(trikePlatformAnnual / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 100}%`}}>
                    <span className="segment-label">Platform</span>
                  </div>
                  <div className="print-stacked-segment training" style={{width: `${(trikeCoursesTotal / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 100}%`}}>
                    <span className="segment-label">Training</span>
                  </div>
                  <div className="print-stacked-segment labor" style={{width: `${((trikeTotalHours * inputs.avgHourlyRate) / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 100}%`}}>
                    <span className="segment-label">Labor</span>
                  </div>
                </div>
                <div className="print-stacked-total">{formatCurrency(trikeGrandTotal + (trikeTotalHours * inputs.avgHourlyRate))}</div>
              </div>
            </div>
            <div className="print-stacked-legend">
              <span><span className="dot platform"></span> Platform</span>
              <span><span className="dot training"></span> Training/Certs</span>
              <span><span className="dot tools"></span> Add&apos;l Tools</span>
              <span><span className="dot labor"></span> Labor</span>
            </div>
          </div>

          {/* 3-Year Cumulative Savings */}
          <div className="print-section">
            <h2 className="print-section-title">3-Year Cumulative Savings Projection</h2>
            <div className="print-projection-chart">
              <div className="print-projection-grid">
                <div className="print-projection-year">
                  <div className="year-label">Year 1</div>
                  <div className="year-bars">
                    <div className="year-bar rto">
                      <span className="bar-value">{formatCurrency(rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))}</span>
                      <div className="bar-fill" style={{height: '120px'}}></div>
                      <span className="bar-label">RTO360</span>
                    </div>
                    <div className="year-bar trike">
                      <span className="bar-value">{formatCurrency(trikeGrandTotal + (trikeTotalHours * inputs.avgHourlyRate))}</span>
                      <div className="bar-fill" style={{height: `${Math.round(((trikeGrandTotal + (trikeTotalHours * inputs.avgHourlyRate)) / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 120)}px`}}></div>
                      <span className="bar-label">Trike</span>
                    </div>
                  </div>
                  <div className="year-savings">Save {formatCurrency(totalSavingsValue)}</div>
                </div>
                <div className="print-projection-year">
                  <div className="year-label">Year 2</div>
                  <div className="year-bars">
                    <div className="year-bar rto">
                      <span className="bar-value">{formatCurrency((rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate)) * 2)}</span>
                      <div className="bar-fill" style={{height: '120px'}}></div>
                      <span className="bar-label">RTO360</span>
                    </div>
                    <div className="year-bar trike">
                      <span className="bar-value">{formatCurrency((trikeGrandTotal + (trikeTotalHours * inputs.avgHourlyRate)) * 2)}</span>
                      <div className="bar-fill" style={{height: `${Math.round(((trikeGrandTotal + (trikeTotalHours * inputs.avgHourlyRate)) / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 120)}px`}}></div>
                      <span className="bar-label">Trike</span>
                    </div>
                  </div>
                  <div className="year-savings">Save {formatCurrency(totalSavingsValue * 2)}</div>
                </div>
                <div className="print-projection-year">
                  <div className="year-label">Year 3</div>
                  <div className="year-bars">
                    <div className="year-bar rto">
                      <span className="bar-value">{formatCurrency((rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate)) * 3)}</span>
                      <div className="bar-fill" style={{height: '120px'}}></div>
                      <span className="bar-label">RTO360</span>
                    </div>
                    <div className="year-bar trike">
                      <span className="bar-value">{formatCurrency((trikeGrandTotal + (trikeTotalHours * inputs.avgHourlyRate)) * 3)}</span>
                      <div className="bar-fill" style={{height: `${Math.round(((trikeGrandTotal + (trikeTotalHours * inputs.avgHourlyRate)) / (rtoGrandTotal + (rtoTotalHours * inputs.avgHourlyRate))) * 120)}px`}}></div>
                      <span className="bar-label">Trike</span>
                    </div>
                  </div>
                  <div className="year-savings">Save {formatCurrency(totalSavingsValue * 3)}</div>
                </div>
              </div>
              <div className="print-projection-summary">
                <div className="projection-total">
                  <span className="projection-label">3-Year Total Savings</span>
                  <span className="projection-value">{formatCurrency(totalSavingsValue * 3)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="print-footer">
            <p>This analysis is based on current operational data and Trike&apos;s proposed pricing.</p>
            <p>For questions, contact your Trike representative.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
