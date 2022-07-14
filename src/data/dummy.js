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
