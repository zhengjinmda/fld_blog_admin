import React, { useState } from 'react'
import 'antd/dist/antd.css'
import { Input, Card, Button, Spin, message } from 'antd'
import { UserOutlined, KeyOutlined } from '@ant-design/icons'
import servicePath from '../config/apiUrl'

import '../static/css/login.css'
import axios from 'axios'

function Login(props) {
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const checkLogin = () => {
        setIsLoading(true)
        if (!userName) {
            message.error('用户名不能为空')
            setTimeout(() => {
                setIsLoading(false)
            }, 500)
            return false
        } else if (!password) {
            message.error('密码不能为空')
            setTimeout(() => {
                setIsLoading(false)
            }, 500)
            return false
        }
        let dataProps = {
            'userName': userName,
            'password': password
        }
        axios({
            method:'post',
            url:servicePath.checkLogin,
            data:dataProps,
            withCredentials: true
        }).then(
           res=>{
                console.log(res.data)
                setIsLoading(false)
                if(res.data.data=='登录成功'){
                    localStorage.setItem('openId',res.data.openId)
                    props.history.push('/index')
                }else{
                    message.error('用户名密码错误')
                }
           }
        )
    }

    return (
        <div className='login-div'>
            <Spin tip="Loading..." spinning={isLoading} >
                <Card title="FLD Blog  System" bordered={true} style={{ width: 400 }} >
                    <Input
                        id='userName'
                        size='large'
                        placeholder='Enter you youName'
                        prefix={<UserOutlined />}
                        onChange={e => setUserName(e.target.value)}
                    />
                    <br /><br />
                    <Input.Password
                        id='password'
                        size='large'
                        placeholder='Enter you password'
                        prefix={<KeyOutlined />}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <br /><br />
                    <Button type='primary' size='large' block onClick={checkLogin} >Login in</Button>
                </Card>
            </Spin>
        </div>
    )
}

export default Login