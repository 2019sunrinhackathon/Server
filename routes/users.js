var express = require('express');
var router = express.Router();

var {User,Article} = require('../DB/User');

router.get('/',function(res,req){
  console.log('Server Running...');
  res.send('Server Runnning...');
});

router.get('/get/articles',function(req,res){
  Article.find({}).sort({date:-1}).exec(function(err,result){
    if(err) throw err;
    console.log(result);
    res.send(result);
  });
});

router.get('/get/findArticles',function(req,res){
  var title = req.query.title;
  console.log(title);
  Article.find({title: title},function(err,result){
    if(err) throw err;
    if(result != null){
      console.log(result);
      res.send(result);
    }else{
      console(result);
      res.status(404).send({"msg":"제목 관련한 게시글이 없습니다."})
    }
  });
});

router.get('/get/comments',function(req,res){
  var id = req.query.id;
  var title = req.query.title;
  Article.find({id: id, title: title}).select({"comment" : 1,"_id": 0}).exec(function(err, result){
    if(err) throw err;
    console.log(result);
    res.send(result);
  });
});

router.get('/get/options',function(req,res){
  var option = req.query.option;
  Article.find({option:option}).sort({date:-1}).exec(function(err,result){
    if(err) throw err;
    console.log(result);
    res.send(result);
  });
});

router.post('/post/user',function(req,res) {
  console.log(req.body);
  let id = req.body.id;
  let passwd = req.body.passwd;
  let email = req.body.email;
  User.findOne({email: email}, function(err,result){
    if(err) throw err;
    if(result == null){
      User.findOne({id:id},function(err,result){
        if(err) throw err;
        if(result == null){//새로 만들때
          const user = new User({
            id: id,
            passwd: passwd,
            email: email,
          })
          user.save(function(err,result){
            if(err) throw err;
            console.log(result)
            res.send(result);
          });
        }else{// 이미 계정이 있을때
          console.log('이미 사용 중인 아이디가 있습니다.');
          res.status(404).send({"msg": "이미 아이디가 있습니다."});
        }
      });
    }else{
      console.log('이미 계정이 있습니다.');
      res.status(404).send({"msg": "이미 계정이 있습니다."});
    }
  });
});

router.post('/post/login',function(req,res){
  let login = new User({
    id: req.body.id,
    passwd: req.body.passwd
  });
  User.findOne({id:login.id},function(err,result){
    if(err) throw err;
    if(result != null){// 만약 계정이 있을 때
      if(result.passwd != login.passwd){// 만약 비밀번호가 틀렸을 때
        console.log('Wrong password');
        res.status(404).send({"msg": "잘못된 비번입니다."});
      }else{
        console.log(result);
        res.send(result);
      }
    }else{
      console.log('No user');
      res.status(404).send({"msg": "없는 계정입니다."});
    }
  });
})

router.post('/post/article',function(req,res){
  const id = req.body.id;
  let date = new Date();
  date.setHours(date.getHours() + 1);
  let article = new Article({
    title: req.body.title,
    text: req.body.text,
    option: req.body.option,
    date: date,
  });
  console.log(date.getHours());
  User.find({id:id},function(err,result){
    if(result!= null){
      //User.article.push(article.title, article.text);
      article.save(function(err,result){
        if(err) throw err;
        console.log(result);
        res.send(result);
      });
    }
  });
});

router.post('/post/comment',function(req,res){
  const id = req.body.id;
  const title = req.body.title;
  Article.findOne({id: id, title: title},function(err,result){
    if(err) throw err;
    if(result != null){
      result.comment.push(req.body.comment);
      result.save(function(err,result){
        if(err) throw err;
        console.log(result);
        res.send(result);
      });
    }
    else{
      console.log('No article');
      res.status(404).send({"msg": "없는 계시물입니다."});
    }
  });
});

router.post('/post/deleteUser',function(req,res){
  const id = req.body.id;
  const passwd = req.body.passwd;
  User.findOne({id:id}).select({"passwd" : 1,"_id": 0}).exec(function(err, result){
    if(err) throw err;
    console.log(result);
    if(result.passwd == passwd){
      User.deleteOne({id:id},function(err,result){
        console.log(result);
        res.send(result);
      });
    }else{
      console.log('Wrong password');
      res.status(404).send({"msg": "잘못된 비번입니다."});
    }
  });
});

router.post('/post/deleteArticle',function(req,res){
  const id = req.body.id;
  const title = req.body.title
  User.findOne({id: id},function(err,result){
    if(err) throw err;
    Article.deleteOne({title:title},function(err,result){
      if(err) throw err;
      console.log(result);
      console.log(title+' deleted');
      res.send(result);
    });
  });
});

module.exports = router;