import {BiHomeAlt} from 'react-icons/bi';
import {BsStack,BsBellFill,BsPersonFill} from 'react-icons/bs';
import {HiOutlineLogout} from 'react-icons/hi'
export const links = [
    {
        title:'Students',
        links:[
            {
                name:'Dashboard',
                icon:<BiHomeAlt/>,
            },
            {
                name:'Results',
                icon:<BsStack/>,
            },
            {
                name:'Notifications',
                icon:<BsBellFill/>,
            },
            {
                name:'Profile',
                icon:<BsPersonFill/>,
            },
            {
                name:'Logout',
                icon:<HiOutlineLogout/>,
            },
        ],
    }
]

export const courses =[
    {
        coursename: 'Software Architecture',
        code: 'SA001',
        update:'21 Feb,2022'
        
    },
    {
        coursename: 'Operating Systems',
        code: 'OS002',
        update:'30 June,2022'
        
    },
    {
        coursename: 'Requirements Engineering',
        code: 'RE004',
        update:'5 Apr,2022'
        
    },
    {
        coursename: 'Object Oriented Programming',
        code: 'OP003',
        update:'14 Mar,2022'
        
    },
]

export const studentResults =[
    {
        CourseName: 'CN006 Computer Networks',
        AttemptedDate: '9 June, 2022',
        ScoreEarned: '90/100',
        QuestionsAttempted:'9/9'
    },
    {
        CourseName: 'CL007 Computer Literacy',
        AttemptedDate: '17 June, 2022',
        ScoreEarned: '100/100',
        QuestionsAttempted:'10/10'
    },
    {
        CourseName: 'OS002 Operating systems',
        AttemptedDate: '29 June, 2022',
        ScoreEarned: '98/100',
        QuestionsAttempted:'15/15'
    },
    {
        CourseName: 'SA001 Software Architecture',
        AttemptedDate: '1 Juy, 2022',
        ScoreEarned: '95/100',
        QuestionsAttempted:'20/20'
    },
    {
        CourseName: 'OOP003 Object Oriented Programming',
        AttemptedDate: '4 July, 2022',
        ScoreEarned: '85/100',
        QuestionsAttempted:'25/25'
    },
    {
        CourseName: 'Requirements Engineering',
        AttemptedDate: '10 July, 2022',
        ScoreEarned: '80/100',
        QuestionsAttempted:'30/30'
    },
    {
        CourseName: 'CN006 Computer Networks',
        AttemptedDate: '9 June, 2022',
        ScoreEarned: '90/100',
        QuestionsAttempted:'9/9'
    },
    {
        CourseName: 'CL007 Computer Literacy',
        AttemptedDate: '17 June, 2022',
        ScoreEarned: '100/100',
        QuestionsAttempted:'10/10'
    },
    {
        CourseName: 'OS002 Operating systems',
        AttemptedDate: '29 June, 2022',
        ScoreEarned: '98/100',
        QuestionsAttempted:'15/15'
    },
    {
        CourseName: 'SA001 Software Architecture',
        AttemptedDate: '1 Juy, 2022',
        ScoreEarned: '95/100',
        QuestionsAttempted:'20/20'
    },
    {
        CourseName: 'OOP003 Object Oriented Programming',
        AttemptedDate: '4 July, 2022',
        ScoreEarned: '85/100',
        QuestionsAttempted:'25/25'
    },
    {
        CourseName: 'Requirements Engineering',
        AttemptedDate: '10 July, 2022',
        ScoreEarned: '80/100',
        QuestionsAttempted:'30/30'
    },
]

export const studentResultsGrid = [
    {
        field:'CourseName',
        headerText:'Course Name',
        textAlign:'Left',
        width:'150',
        isPrimaryKey:true,
    },
    {
        field:'AttemptedDate',
        headerText:'Attempted Date',
        textAlign:'Left',
        width:'150',
        format:'yMd'
    },
    {
        field:'ScoreEarned',
        headerText:'Score Earned',
        textAlign:'Left',
        width:'150'
    },
    {
        field:'QuestionsAttempted',
        headerText:'Questions Attempted',
        textAlign:'Left',
        width:'150'
    },
]

export const notifications = [
    {
        name:'Quiz updated for course CN006 Computer Networks',

    },
    {
        name:'Added a new course CN006 Computer Networks',

    },
    {
        name:'General knowledge Quiz completed',
      
    },
    {
        name:'Profile Updated'
    }
]