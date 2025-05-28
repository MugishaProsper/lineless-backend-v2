import mongoose from "mongoose";
import { generateQueueToken } from "../utils/generate.queue_token.js";

const queueSchema = mongoose.Schema({
  serviceId : { type : mongoose.Schema.Types.ObjectId, ref : "Service", required : true },
  queueMembers : [{ 
      user : { type : mongoose.Schema.Types.ObjectId, ref : "User"},
      joinedAt : { type : Date, default : Date.now },
      position : { type : Number },
      token : { type : String, required : true } 
  }]
}, { timestamps : true });

// Method to add a new member to the queue
queueSchema.methods.addMember = async function(userId) {
  const token = generateQueueToken(userId);
  const position = this.queueMembers.length + 1;
  
  this.queueMembers.push({
    user: userId,
    joinedAt: new Date(),
    position,
    token
  });
  
  return this.save();
};

// Method to remove a member from the queue
queueSchema.methods.removeMember = async function(userId) {
  const memberIndex = this.queueMembers.findIndex(member => member.user.toString() === userId.toString());
  
  if (memberIndex === -1) {
    throw new Error('Member not found in queue');
  }

  // Remove the member from the queue
  this.queueMembers.splice(memberIndex, 1);
  
  // Shift all members after the removed member one position forward
  for (let i = memberIndex; i < this.queueMembers.length; i++) {
    this.queueMembers[i].position = i + 1;
  }
  
  return this.save();
};

// Method to get member position
queueSchema.methods.getMemberPosition = function(userId) {
  const member = this.queueMembers.find(member => member.user.toString() === userId.toString());
  return member ? member.position : null;
};

// Method to validate member token
queueSchema.methods.validateToken = function(userId, token) {
  const member = this.queueMembers.find(member => 
    member.user.toString() === userId.toString() && 
    member.token === token
  );
  return !!member;
};

const Queue = mongoose.model("Queue", queueSchema);

export default Queue;

