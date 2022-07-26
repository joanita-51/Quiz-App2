import { Header, Navbar } from '../components'
import { GridComponent, ColumnsDirective,ColumnDirective,Page,Inject,Sort,Filter } from '@syncfusion/ej2-react-grids'
import { studentResults, studentResultsGrid } from '../data/dummy'
import Search from '../components/Search'
import { useState, useEffect } from 'react'

const filterResults = (searchValue) =>{
  if (searchValue === "") {
    return studentResults;
  }
  return studentResults.filter((result)=>
    result.CourseName.toLowerCase().includes(searchValue.toLowerCase()) ||
    result.ScoreEarned.includes(searchValue) 
  )
}
const Results = () => {
  const [data, setdata] = useState(studentResults)

  //for searching
  const [searchValue, setSearchValue]= useState('')
  useEffect(() => {
    const filteredResults = filterResults(searchValue)
    setdata(filteredResults)
  }, [searchValue])
  

  return (
    <div className='w-full'>
      <Navbar/>
      <div className='m-2 p-2 rounded-lg mt-12'>
        <div className='flex justify-between mb-3'>
          <Header title='Results' size={(Object.keys(studentResults)).length} />
          <Search callback={(searchValue)=> setSearchValue(searchValue)}/>
        </div>
        
        <GridComponent
          dataSource={data}
          allowPaging = {true}
          pageSettings={{pageSize:5}}
          allowSorting = {true}
          allowSearch = {true}
        
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