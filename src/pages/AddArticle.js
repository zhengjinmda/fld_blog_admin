import React, { useState, useEffect } from 'react'
import marked from 'marked'
import '../static/css/addArticle.css'
import { Row, Col, Input, Select, Button, DatePicker, message } from 'antd'
import axios from 'axios'
import servicePath from '../config/apiUrl'

const { Option } = Select
const { TextArea } = Input

function AddArticle(props) {

    const [articleId, setArticleId] = useState(0) // 文章ID，
    const [articleTitle, setArticleTitle] = useState('') // 文章标题
    const [articleContent, setArticleContent] = useState('') //markdown的编辑内容
    const [markdownContent, setMarkdownContent] = useState('预览内容') //html内容
    const [introducemd, setIntroducemd] = useState('') //简介的 markdown 内容
    const [introducehtml, setIntroducehtml] = useState('等待编辑') //简介的html内容
    const [showDate, setShowDate] = useState() //发布日期
    const [typeInfo, setTypeInfo] = useState([]) //文章类别
    const [selectedType, setSelectType] = useState('选择类型') //选择的文章类别

    useEffect(() => {
        getTypeInfo()
        //获得文章ID
        let tmpId = props.match.params.id
        if (tmpId) {
            setArticleId(tmpId)
            getArticleById(tmpId)
        }
    }, [])

    //设置 marked
    marked.setOptions({
        renderer: marked.Renderer(),
        gfm: true,
        pedantic: false,
        sanitize: false,
        tables: true,
        breaks: false,
        smartLists: true,
        smartypants: false,
    })
    //同步更新内容语言
    const changeContent = e => {
        setArticleContent(e.target.value)
        let html = marked(e.target.value)
        setMarkdownContent(html)
    }
    //同步更新简介预览
    const changeIntroduce = e => {
        setIntroducemd(e.target.value)
        let html = marked(e.target.value)
        setIntroducehtml(html)
    }
    //获取type
    const getTypeInfo = () => {
        axios({
            method: 'get',
            url: servicePath.getTypeInfo,
            withCredentials: true
        }).then(res => {
            if (res.data.data === '没有登录') {
                localStorage.removeItem('openId')
                props.history.push('/')
            } else {
                setTypeInfo(res.data.data)
            }
        })
    }

    //改变文章type
    const selectTypeHandler = value => {
        setSelectType(value)
    }

    // 保存文章
    const saveArticle = () => {
        //校验
        if (selectedType === '选择类型') {
            message.error('文章类别不能为空')
            return false
        } else if (!articleTitle) {
            message.error('文章标题不能为空')
            return false
        } else if (!articleContent) {
            message.error('文章内容不能为空')
            return false
        } else if (!introducemd) {
            message.error('文章简介不能为空')
            return false
        } else if (!showDate) {
            message.error('发布日期不能为空')
            return false
        }

        //date 保存的是String 要转换为日期格式
        let dateText = showDate.replace('-', '/') //把字符串转化为时间戳

        let dataProps = { //添加的文章内容
            type_id: selectedType,
            title: articleTitle,
            article_content: articleContent,
            introduce: introducemd,
            addTime: (new Date(dateText).getTime()) / 1000
        }

        console.log(dataProps)

        if (articleId === 0) { //判断 如果是第一次添加
            dataProps.view_count = 0 //第一次则设置观看人数为0
            axios({
                method: 'post',
                url: servicePath.addArticle,
                header: { 'Access-Control-Allow-Origin': '*' },
                data: dataProps,
                withCredentials: true
            }).then(res => {
                setArticleId(res.data.insertId) // 改变insertID 将文章设置为不是第一次添加
                if (res.data.isSuccess) {
                    message.success('文章添加成功')
                } else {
                    message.error('文章添加失败')
                }
            })
        } else { //不是第一次添加 则进行修改
            dataProps.id = articleId
            axios({
                method: 'post',
                url: servicePath.updateArticle,
                header: { 'Access-Control-Allow-Origin': '*' },
                data: dataProps,
                withCredentials: true
            }).then(res => {
                if (res.data.isSuccess) {
                    message.success('文章更新成功')
                } else {
                    message.error('文章更新失败')
                }
            })
        }
    }

    // 根据 id 获取文章详细信息
    const getArticleById = (id) => {
        axios(servicePath.getArticleById + id, {
            withCredentials: true,
            header: { 'Access-Control-Allow-Origin': '*' }
        }).then(
            res => {
                //let articleInfo= res.data.data[0]
                setArticleTitle(res.data.data[0].title)
                setArticleContent(res.data.data[0].article_content)
                let html = marked(res.data.data[0].article_content)
                setMarkdownContent(html)
                setIntroducemd(res.data.data[0].introduce)
                let tmpInt = marked(res.data.data[0].introduce)
                setIntroducehtml(tmpInt)
                setShowDate(res.data.data[0].addTime)
                setSelectType(res.data.data[0].typeId)

            }
        )
    }


    return (
        <div>
            <Row gutter={5}>
                <Col span={18}>
                    <Row gutter={10}>
                        {/* 头部 */}
                        <Col span={20}>
                            <Input placeholder='博客标题' size='large' onChange={e => { setArticleTitle(e.target.value) }} />
                        </Col>
                        <Col span={4}>
                            <Select defaultValue={selectedType} onChange={selectTypeHandler} size='large'>
                                {
                                    typeInfo.map((item, index) => {
                                        return (<Option key={index} value={item.Id}>{item.typeName}</Option>)
                                    })
                                }
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={10} className='content-div' >
                        <Col span={12}>
                            <TextArea
                                className='markdown-content'
                                rows={21}
                                placeholder='文章内容'
                                value={articleContent}
                                onChange={changeContent}
                            />
                        </Col>
                        <Col span={12}>
                            <div className='show-html' dangerouslySetInnerHTML={{ __html: markdownContent }}>
                            </div>
                        </Col>
                    </Row>
                </Col>
                <Col span={6}>
                    <Row>
                        <Col span={24}>
                            <Button size="large">暂存文章</Button>&nbsp;&nbsp;&nbsp;
                            <Button type="primary" size="large" onClick={saveArticle}>发布文章</Button>
                            <br />
                        </Col>
                        <Col span={24}>
                            <br />
                            <TextArea
                                rows={4}
                                placeholder="文章简介"
                                value={introducemd}
                                onChange={changeIntroduce}
                            />
                            <br /><br />
                            <div className="introduce-html" dangerouslySetInnerHTML={{ __html: introducehtml }}></div>
                        </Col>
                        <Col span={12}>
                            <div className="date-select">
                                <DatePicker
                                    onChange={(date, dateString) => { setShowDate(dateString) }}
                                    placeholder="发布日期"
                                    size="large"
                                />
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}

export default AddArticle