
const PostModel=require('../models/post.model');

//GET
module.exports.getPosts=async (req,res)=>{
    const posts =await PostModel.find();
res.status(200).json(posts)
}

//POST
module.exports.setPosts= async(req , res)=>{
    
    if(!req.body.message){
        res.status(400).json({message:"Ecrire klk chose"});
    }
    const post=await PostModel.create({
        message:req.body.message,
        author:req.body.author
    });
    res.status(200).json(post);
    
};

//put
module.exports.editPost= async(req,res)=>{
    const post=await PostModel.findById(req.params.id)

    if(!post){
        res.status(400).json({message:"Ce post n'existe pas"});
    }
    const updatePost=await PostModel.findByIdAndUpdate(post, req.body,{
        new:true,
    });
    res.status(200).json(updatePost);
};
//Delete
module.exports.deletePost= async(req,res)=>{
    const post=await PostModel.findById(req.params.id)

    if(!post){
        res.status(400).json({message:"Ce post n'existe pas"});
    }
    await post.remove();
   res.status(200).json("Message supprimé"+ req.params.id);
    };
