import React from 'react'
import { Navbar } from '../components'
import { GridComponent, ColumnsDirective,ColumnDirective,Page,Selection,Inject,Edit,Toolbar,Sort,Filter } from '@syncfusion/ej2-react-grids'
import { studentResults } from '../data/dummy'

const Results = () => {
  return (
    <div className='w-full'>
      <Navbar/>
      <GridComponent
        dataSource={studentResults}
        allowPaging
        allowSorting
        width='auto'
      >

      </GridComponent>
    </div>
  )
}

export default Results