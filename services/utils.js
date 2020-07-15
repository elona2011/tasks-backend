module.exports = {
    getNameByType(task_type) {
        return task_type == '关注' ? 'follow' : (task_type == '点赞' ? 'thumb' : 'comment')
    }
}
