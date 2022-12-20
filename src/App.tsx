import React from 'react';
import './App.css';
import { useForm, Controller } from "react-hook-form";
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';

interface FormData {
  visitorNameOption?: {label: string, value: string};
  employeeNameOption?: {label: string, value: string};
  trafficDirection?: 'coming' | 'going';
}

interface TrafficRecordEntry {
  name: string;
  count: number;
  id: number;
  type: string;
}

const incrementSubmittedComingNames = ({ visitorNameOption, employeeNameOption, trafficDirection }: { visitorNameOption: {label: string, value: string}, employeeNameOption: {label: string, value: string}, trafficDirection: 'coming' | 'going'}) => {
  let previousTrafficRecords: { entries: TrafficRecordEntry[] } = JSON.parse(localStorage.getItem('previousTrafficRecords')|| '{ "entries": [] }');
  
  if (previousTrafficRecords?.entries?.length === 0) {
    localStorage.setItem('previousTrafficRecords', '{ "entries": [] }');
    previousTrafficRecords = JSON.parse(localStorage.getItem('previousTrafficRecords') || '{ "entries": [] }');
  }
  
  let updatedTrafficRecords: { entries: TrafficRecordEntry[] } = previousTrafficRecords;

  let currentVisitorExistsAlready = false;
  let currentEmployeeExistsAlready = false;

  const noUsersHaveEverSignedIn = previousTrafficRecords.entries.length === 0; 

  if (noUsersHaveEverSignedIn) {
    updatedTrafficRecords.entries.push({
      name: visitorNameOption.value,
      count: 1,
      id: previousTrafficRecords.entries.length,
      type: 'visitor'
    })
    updatedTrafficRecords.entries.push({
      name: employeeNameOption.value,
      count: 1,
      id: previousTrafficRecords.entries.length,
      type: 'employee'
    })
  } else {
    updatedTrafficRecords.entries = previousTrafficRecords.entries.map((previousTrafficEntry: TrafficRecordEntry) => {
      if (previousTrafficEntry.name === visitorNameOption.value && trafficDirection === 'coming') {
        previousTrafficEntry.count++;
        currentVisitorExistsAlready = true;
      }
      if (previousTrafficEntry.name === employeeNameOption.value && trafficDirection === 'coming') {
        previousTrafficEntry.count++;
        currentEmployeeExistsAlready = true;
      }
      
      return previousTrafficEntry;
    })

    if (!currentEmployeeExistsAlready) {
      updatedTrafficRecords.entries.push({
        name: employeeNameOption.value,
        count: 1,
        id: updatedTrafficRecords.entries.length,
        type: 'employee'
      })
    }
    if (!currentVisitorExistsAlready) {
      updatedTrafficRecords.entries.push({
        name: visitorNameOption.value,
        count: 1,
        id: updatedTrafficRecords.entries.length,
        type: 'visitor'
      })
    }
  }

  localStorage.setItem('previousTrafficRecords', JSON.stringify(updatedTrafficRecords));
}

function App() {
  const { register, handleSubmit, formState: { errors }, reset: resetForm, control } = useForm();

  const sendFormDataToNetlifyFunction = async (data: FormData) => {
    const { visitorNameOption, employeeNameOption, trafficDirection } = data;

    console.log('data', data)
    
    if (!visitorNameOption || !employeeNameOption || !trafficDirection) {
      return;
    }

    incrementSubmittedComingNames({ visitorNameOption, employeeNameOption, trafficDirection })

    const eventDateTime = new Date();
    const eventDateTimeISOString = eventDateTime.toISOString();
    const result = await axios.post(
      process.env.NODE_ENV === 'production' 
      ? '<YOUR_PRODUCTION_DOMAIN_GOES_HERE>/.netlify/functions/comego-request'
      : './.netlify/functions/comego-request/comego-request.js​​​',
      JSON.stringify({ visitorName: visitorNameOption.value, employeeName: employeeNameOption.value, trafficDirection, eventDateTimeISOString })
    );
    

    if (result.status === 200) {
      alert('Success! We got your message.')
      resetForm();
    } else {
      alert('Sorry, it looks like there was a problem getting your request.')
    }
  }

  const trafficEventRecords: { entries: TrafficRecordEntry[] } = JSON.parse(localStorage.getItem('previousTrafficRecords') || '{ "entries": [] }');

  const employeeRecordEntries = trafficEventRecords.entries.filter((entry: TrafficRecordEntry) => entry.type === 'employee');

  const visitorRecordEntries = trafficEventRecords.entries.filter((entry: TrafficRecordEntry) => entry.type === 'visitor');

  visitorRecordEntries.sort((a,b) => b.count - a.count);
  employeeRecordEntries.sort((a,b) => b.count - a.count);

  const visitorRecordEntryOptions = visitorRecordEntries.map(entry => ({
    label: entry.name,
    value: entry.name
  }))
  const employeeRecordEntryOptions = employeeRecordEntries.map(entry => ({ label: entry.name, value: entry.name}))

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',  backgroundSize: 'cover' }} className="App">
      <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', maxWidth: 660, borderRadius: 30, padding: '40px 60px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>YOUR_SITE_NAME</h1>
          <p>
            Please sign in any guests you have with you and sign them out when they leave.
          </p>
          <br />
        </div>

        <form
          onSubmit={
            handleSubmit(sendFormDataToNetlifyFunction)
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              textAlign: 'left',
            }}
          >
            <section style={{ width: '100%'}}>
              <label>Visitor Name</label>
              <Controller
                name="visitorNameOption"
                control={control}
                rules={{required: true}}
                render={({ field }) => (
                  <CreatableSelect
                    isClearable
                    styles={{ 
                      option: (baseStyles, state) => ({
                        ...baseStyles,
                        color: 'black'

                      }),
                      container: (baseStyles, state) => ({
                        ...baseStyles,
                        width: '100%'

                      }),
                    }}
                    {...field}
                    options={visitorRecordEntryOptions}
                  />
                )}
              />
            </section>
         
            {errors.visitorNameOption && errors.visitorNameOption.type === "required" && <span style={{ color: 'red', marginTop: '10px' }}>Visitor name is required</span>}

            <section style={{ width: '100%'}}>
              <label>Employee Name</label>
              <Controller
                name="employeeNameOption"
                control={control}
                rules={{required: true}}
                render={({ field }) => (
                  <CreatableSelect
                    isClearable
                    styles={{ 
                      option: (baseStyles, state) => ({
                        ...baseStyles,
                        color: 'black'

                      }),
                      container: (baseStyles, state) => ({
                        ...baseStyles,
                        width: '100%'

                      }),
                    }}
                    {...field}
                    options={employeeRecordEntryOptions}
                  />
                )}
              />
            </section>
            
            {errors.employeeNameOption && errors.employeeNameOption.type === "required" && <span>Employee name is required</span>}
            
            <br />
            <div className="radio-wrapper" style={{ display: 'flex', width: '100%' }} >
              <input
                  {...register("trafficDirection")}
                  type="radio"
                  value="coming"
                  id="field-coming"
                  hidden={true}
                  
                  defaultChecked
                  name="trafficDirection"
                  className="radio"
              />
              <label   style={{ display: 'flex' }} htmlFor="field-coming">
                  Coming
              </label>
              <input
                  className="radio"
                  {...register("trafficDirection")}
                  type="radio"
                  value="going"
                  name="trafficDirection"
                  id="field-going"
              />
              <label  style={{ display: 'flex' }} htmlFor="field-going">
                  Going
              </label>
            </div>

            {errors.trafficDirection && errors.trafficDirection.type === "required" && <span>Visitor traffic direction is required</span>}
          </div>
          <input disabled={!!errors.employeeNameOption || !!errors.visitorNameOption} type="submit" />
        </form>
      </div>
    </div>
  );
}

export default App;
