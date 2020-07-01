module.exports = {
    getNameByType(task_type) {
        console.log('task_type', task_type, typeof (task_type))
        return task_type == '关注' ? 'follow' : (task_type == '点赞' ? 'thumb' : 'comment')
    }
}
