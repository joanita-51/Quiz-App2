import React,{useState, useEffect} from 'react'
import logo from '../data/logo.png'
import { questions } from '../data/dummy'

const Quiz = () => {
    //show the final results
    const [showResults, setShowResults] = useState(false)
    //Questions state
    const [currentQuestion, setCurrentQuestion] =useState(0)
    //Score state
    const [score, setScore] = useState(0)

    if(currentQuestion<0.5){
        setCurrentQuestion((prev)=>prev+1) 
    }

    const optionClicked = (isCorrect) =>{
        if(isCorrect){
            setScore(score +1)
        }
    }

  return (
    <div className=' m-auto w-7/12'>
        <img src={logo} alt='logo' className='w-64 block ml-auto mr-auto  mt-9'/>
        <div className='bg-white mt-3 p-6 rounded-xl shadow-lg'>
            {/* Header */}
            <h1 className='flex justify-center text-3xl m-3 font-bold'>General Knowledge Quiz</h1>
            <hr />

            {/* Current Score */}
            <h2 className='font-bold'>Score:{score}</h2>

            {/* Question Card */}

            <div className='p-6 tracking-wider'>
            

                {
                    showResults?(
                        <div className='font-bold'>
                            <h1 className='flex justify-center mb-3'>Final Results</h1>
                            <h2 className='flex justify-center mb-3'>{score} out of {questions.length} correct - ({(score / questions.length)*100}%)</h2>
                            <button className='bg-lime-600 text-white rounded-md p-2 mx-auto block'>Try again</button>
                        </div>
                    ):(
                        <form >
                        <div className='mb-5'>
                            {/* Question */}
                            
                            {/* Answers */}

                            {
                                questions.map((question,index)=>(
                                    
                                    <form key={index} >
                                    <h2 className='font-bold'>Question:{index+1}</h2>
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

                           
                            
                        </div>
                    
                        <div className='mb-5'>
                            <h2 className='font-bold'>Question: 2 </h2>
                            <p>Please select your age:</p>
                            <input type="radio" id="age1" name="age" value="30"/>
                            <label for="age1">0 - 30</label><br/>
                            <input type="radio" id="age2" name="age" value="60"/>
                            <label for="age2">31 - 60</label><br/>  
                            <input type="radio" id="age3" name="age" value="100"/>
                            <label for="age3">61 - 100</label> 
                            
                            <button 
                            className='block ml-auto bg-lime-600 text-white rounded-md p-2 '
                            onClick={()=>setShowResults(true)}
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                    )
                }

               
              
            </div>
        </div>
        

    </div>
  )
}

export default Quiz