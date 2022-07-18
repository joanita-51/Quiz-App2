import React from 'react'
import { Header, Navbar } from '../components'
import { GridComponent, ColumnsDirective,ColumnDirective,Page,Selection,Inject,Edit,Toolbar,Sort,Filter } from '@syncfusion/ej2-react-grids'
import { studentResults, studentResultsGrid } from '../data/dummy'
import { BiSearch } from 'react-icons/bi'
const Results = () => {
  return (
    <div className='w-full'>
      <Navbar/>
      <div className='m-2 p-2 rounded-lg mt-12'>
        <Header title='Results' size={(Object.keys(studentResults)).length} />
        <GridComponent
          dataSource={studentResults}
          allowPaging = {true}
          pageSettings={{pageSize:5}}
          allowSorting = {true}
        
          width='auto'
        >
        <ColumnsDirective>
          {studentResultsGrid.map((result,index)=>(
            <ColumnDirective key={index} {...result}/>
          ))}
        </ColumnsDirective>

        <Inject services={[Page, Filter, Sort]}/>
        </GridComponent>
      </div>

    </div>
  )
}

export default Results