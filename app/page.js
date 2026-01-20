'use client';

import { useState, useEffect, useCallback } from 'react';
import './globals.css';

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

  // Calculate total stores
  const totalStores = inputs.storesNC + inputs.storesSC + inputs.storesTX + inputs.storesMS + inputs.storesAR;

  // Calculate populations
  const calculatePopulations = useCallback(() => {
    const avgEmployeesPerStore = inputs.totalEmployees / totalStores;
    const frontlineTurnoverRate = inputs.frontlineTurnover / 100;

    return {
      frontlineTurnoverTotal: Math.round(inputs.totalEmployees * frontlineTurnoverRate),
      txFrontlineTurnover: Math.round((avgEmployeesPerStore * inputs.storesTX) * frontlineTurnoverRate),
      scAllEmployees: Math.round(avgEmployeesPerStore * inputs.storesSC),
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
  const rtoSCFHCostTotal = inputs.rtoSCFHCost * pops.scAllEmployees;
  const rtoCoursesTotal = rtoCoreAnnualCost + rtoTXTABCCostTotal + rtoTXFHCostTotal + rtoSCFHCostTotal;
  const rtoToolsTotal = state.rtoTools.reduce((sum, t) => sum + (t.cost || 0), 0);
  const rtoGrandTotal = rtoPlatformAnnual + rtoCoursesTotal + rtoToolsTotal;

  // RTO Hours
  const rtoCoreHoursTotal = rtoCoreHours * pops.frontlineTurnoverTotal;
  const rtoTXTABCHoursTotal = inputs.rtoTXTABCHours * pops.txFrontlineTurnover;
  const rtoTXFHHoursTotal = inputs.rtoTXFHHours * pops.txFrontlineTurnover;
  const rtoSCFHHoursTotal = inputs.rtoSCFHHours * pops.scAllEmployees;
  const rtoTotalHours = rtoCoreHoursTotal + rtoTXTABCHoursTotal + rtoTXFHHoursTotal + rtoSCFHHoursTotal;

  // Trike Calculations
  const trikePlatformAnnual = inputs.trikePlatformCost * totalStores * 12;
  const trikeTXTABCCostTotal = inputs.trikeTXTABCCost * pops.txFrontlineTurnover;
  const trikeTXFHCostTotal = inputs.trikeTXFHCost * pops.txFrontlineTurnover;
  const trikeSCFHCostTotal = inputs.trikeSCFHCost * pops.scAllEmployees;
  const trikeCoursesTotal = trikeTXTABCCostTotal + trikeTXFHCostTotal + trikeSCFHCostTotal;
  const trikeGrandTotal = trikePlatformAnnual + trikeCoursesTotal;

  // Trike Hours
  const trikeCoreHoursTotal = trikeCoreHours * pops.frontlineTurnoverTotal;
  const trikeTXTABCHoursTotal = inputs.trikeTXTABCHours * pops.txFrontlineTurnover;
  const trikeTXFHHoursTotal = inputs.trikeTXFHHours * pops.txFrontlineTurnover;
  const trikeSCFHHoursTotal = inputs.trikeSCFHHours * pops.scAllEmployees;
  const trikeTotalHours = trikeCoreHoursTotal + trikeTXTABCHoursTotal + trikeTXFHHoursTotal + trikeSCFHHoursTotal;

  // Savings
  const directSavings = rtoGrandTotal - trikeGrandTotal;
  const hoursSaved = rtoTotalHours - trikeTotalHours;
  const laborSavings = hoursSaved * inputs.avgHourlyRate;
  const totalSavingsValue = directSavings + laborSavings;
  const roiMultiple = trikeGrandTotal > 0 ? (totalSavingsValue / trikeGrandTotal).toFixed(1) : 0;

  // Calculate weighted average cert hours per employee based on state populations
  // TX employees: get TX TABC + TX Food Handler
  // SC employees: get SC Food Handler
  // NC/MS/AR employees: get 0 cert hours
  const txCertHoursRTO = inputs.rtoTXTABCHours + inputs.rtoTXFHHours;
  const scCertHoursRTO = inputs.rtoSCFHHours;
  const txCertHoursTrike = inputs.trikeTXTABCHours + inputs.trikeTXFHHours;
  const scCertHoursTrike = inputs.trikeSCFHHours;

  // Weighted average: (TX employees * TX hours + SC employees * SC hours) / total employees trained
  const rtoWeightedCertHours = pops.frontlineTurnoverTotal > 0
    ? ((pops.txFrontlineTurnover * txCertHoursRTO) + (pops.scAllEmployees * scCertHoursRTO)) / pops.frontlineTurnoverTotal
    : 0;
  const trikeWeightedCertHours = pops.frontlineTurnoverTotal > 0
    ? ((pops.txFrontlineTurnover * txCertHoursTrike) + (pops.scAllEmployees * scCertHoursTrike)) / pops.frontlineTurnoverTotal
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
      <h1>Refuel Operating Company</h1>
      <p className="subtitle">Interactive Training Cost Calculator - RTO360 vs Trike</p>

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
              <td style={{fontSize: '12px', color: '#888'}}>SC All Employees</td>
              <td>{pops.scAllEmployees}</td>
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
              <td style={{fontSize: '12px', color: '#888'}}>SC All Employees</td>
              <td>{pops.scAllEmployees}</td>
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
        <button className="primary" onClick={saveCalculation}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
