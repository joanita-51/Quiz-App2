import React,{useState} from 'react'
import logo from '../data/logo.png'
import { questions } from '../data/dummy'
import { Link } from 'react-router-dom'
import {IoIosArrowBack} from 'react-icons/io'
const Quiz = () => {
    //show the final results
    const [showResults, setShowResults] = useState(false)
    //Score state
    const [score, setScore] = useState(0)

    const optionClicked = (isCorrect) =>{
        if(isCorrect){
            setScore(score +1)
        }
    }

    const tryAgain = ()=>{
        setScore(0)
        setShowResults(false)
    }

  return (
    <div className=' m-auto w-7/12'>
        <img src={logo} alt='logo' className='w-64 block ml-auto mr-auto  mt-9'/>
        <div className='bg-white mt-3 p-6 rounded-xl shadow-lg'>
            {/* Header */}
            <h1 className='flex justify-center text-3xl m-3 font-bold'>General Knowledge Quiz</h1>
            <hr />

            {/* Question Card */}

            <div className='p-6 tracking-wider'>
            

                {
                    showResults?(
                        <div className='font-bold'>
                            <h1 className='flex justify-center mb-3'>Final Results</h1>
                            <h2 className='flex justify-center mb-3'>{score} out of {questions.length} correct - ({(score / questions.length)*100}%)</h2>
                            <button 
                                className='bg-lime-600 text-white rounded-md p-2 mx-auto block'
                                onClick={()=>tryAgain()}
                            >
                                Try again
                            </button>
                        </div>
                    ):(
                    <div className='mb-5'>
                       {
                            questions.map((question,index)=>(
                                    
                                <form key={index} >
                                    <h2 className='font-bold mt-4'>Question:{index+1}</h2>
                                    <p>{question.question}</p>
                                    {question.options.map((option)=>(
                                        <>
                                            <input type={question.fieldtype} 
                                            id={option.answer} 
                                            name={question.fieldname} 
                                            onClick ={()=>optionClicked(option.isCorrect)}
                                            />
                                            <label >{option.answer}</label> <br />
                                        </>

                                    ))}
                                </form>
                                ))
                        }
                        <div className='flex justify-between mt-6'>
                            <Link to='/Dashboard'>
                            <button 
                                className='bg-lime-600 text-white rounded-md p-2 '
                            
                            >
                                <div className='flex leading-tight'>
                                <IoIosArrowBack />
                                <IoIosArrowBack/>
                                    Back    
                                </div>

                            </button> 
                            </Link>
                            <button 
                                className='bg-lime-600 text-white rounded-md p-2 leading-tight'
                                onClick={()=>setShowResults((prev)=> !prev)}
                            >
                                submit
                            </button>   
                        </div>



                            
                    </div>
                    


                    )
                }

               
              
            </div>
        </div>
        

    </div>
  )
}

export default Quiz