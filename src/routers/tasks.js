const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const tasksRouters = new express.Router();

// TASK CREATE

tasksRouters.post("/tasks/create", auth, async (req, res) => {
    const data = req.body;
    data.owner = req.user._id;
    const newTask = new Task(data);
    /* 
      ? another way to create the new task is by using the ES6 Spread Operator(...)
      const newTask = new Task({
          ...req.body,
          owner: req.user._id
      });
      */
    try {
        await newTask.save();
        res.status(201).send(newTask);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// GET SINGLE BY ID
tasksRouters.post("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(404).send();
        }
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e.message);
    }
});


// GET ALL BY USER
//! ?completed=true/false
//! ?limit=max results to display
//! ?skip=from which result to start
//! ?sortBy=createdAt:desc
tasksRouters.get("/tasks/read/all", auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.sortBy) {
        const sortByData = req.query.sortBy.split(":")
        sort[sortByData[0]] = sortByData[1] === 'desc' ? -1 : 1
    }

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    try {
        const tasks = await req.user.populate({
            'path': 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        if (!tasks) {
            return res.status(404).send();
        }
        res.status(200).send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// UPDATE SINGLE BY ID
tasksRouters.patch("/tasks/update/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidUpdate = updates.every(update =>
        allowedUpdates.includes(update)
    );

    if (!isValidUpdate) {
        return res.status(400).send("Params not allowed");
    }

    const _id = req.params.id;
    try {
        //const taskToUpdate  = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators:true});

        const taskToUpdate = await Task.findOne({
            _id,
            owner: req.user._id
        });

        if (!taskToUpdate) {
            return res.status(404).send("Task not found");
        }
        updates.forEach(item => (taskToUpdate[item] = req.body[item]));
        await taskToUpdate.save();

        res.status(200).send(taskToUpdate);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

//  DELETE BY ID
tasksRouters.delete("/tasks/delete/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const taskToDelete = await Task.findOneAndDelete({
            _id,
            owner: req.user_id
        });

        if (!taskToDelete) {
            return res.status(404).send();
        }
        res.status(200).send(taskToDelete);
    } catch (e) {
        res.status(500).send(e);
    }
});

// DELETE ALL FOR USER
tasksRouters.delete("/tasks/deleteall", auth, async (req, res) => {
    try {
        await Task.deleteMany({
            owner: req.user._id
        });
        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    }
});
module.exports = tasksRouters;