const express = require("express");
const Quizes = require("../../models/Quizes");
const Set = require("../../models/QuestionSet");
const { auth } = require("../../controllers/authcontroller");
const crypto = require("crypto");
const {
  answer,
  answeredQuizzes,
} = require("../../controllers/Quiz/answer.controller");
const router = express.Router();

//@route    GET api/quiz/test
// @desc    Test quiz route
// @access  Public
router.get("/test", async (req, res) => {
  try {
    const questions = await Quizes.find().select(["-answer"]);
    res.json(questions);
  } catch (err) {
    res.json({ msg: err });
  }
});

//@route    GET api/quiz/questions
// @desc    Test questions route
// @access  Public
router.post("/:set_id/questions", async (req, res) => {
  try {
    const { questions } = req.body;

    const set = await Set.findById(req.params.set_id);

    if (!set) return res.status(404).json({ msg: "set not found." });

    const saved_questions = await await Quizes.insertMany(questions);

    saved_questions.map((x) => set.questions.push(x._id));

    await set.save();

    res.json({ msg: saved_questions });
  } catch (error) {
    res.status(500).json(error);
  }
});

/**
 * @route POST api/quiz/:set_id/question
 * @description Create Question
 * @access Public
 */
router.post("/:set_id/question", async (req, res) => {
  try {
    const { question, options, answer } = req.body;

    const set = await Set.findById(req.params.set_id);

    if (!set) return res.status(404).json({ msg: "set not found." });

    const newQuestion = new Quizes({
      question,
      options: [options],
      answer,
    });

    await newQuestion.save();

    set.questions.push(newQuestion._id);

    await set.save();

    res.json({ msg: newQuestion });
  } catch (error) {
    res.status(500).json(error);
  }
});

/**
 * @route POST api/quiz/set
 * @description Question Set
 * @access Public
 */
router.post("/set", async (req, res) => {
  try {
    const {
      title,
      instruction,
      duration: { hours, minutes, seconds },
    } = req.body;

    const newSet = new Set({
      title,
      instruction,
      duration: {
        hours,
        minutes,
        seconds,
      },
    });

    await newSet.save();

    res.json({ msg: newSet });
  } catch (error) {
    res.status(500).json(error);
  }
});

/**
 * @route GET api/quiz/sets
 * @description Question Sets
 * @access Public
 */

router.get("/sets", async (req, res) => {
  try {
    const sets = await Set.find({}).populate("questions", ["-answer"]);
    res.json({ msg: sets });
  } catch (error) {
    res.status(500).json(error);
  }
});

/**
 * @route GET api/quiz/set/:id
 * @description A Question Set
 * @access Public
 */

router.get("/set/:id", async (req, res) => {
  try {
    const set = await Set.findById(req.params.id).populate("questions", [
      "-answer",
    ]);

    res.status(200).json({ msg: set });
  } catch (error) {
    res.status(500).json(error);
  }
});

/**
 * @route POST api/quiz/answer
 * @description Answer Question
 * @access Private
 */

router.post("/answer", auth, answer);

/**
 * @route GET api/quiz/answered-quizzes
 * @description Get answers
 * @access Private
 */
router.get("/answered-quizzes", auth, answeredQuizzes);

// const options = ["20", "30", "40", "50"];

// const option = {};
// const letters = ["A", "B", "C", "D", "E", "F", "G"];
// options.map((x, i) => {
//   option[letters[i]] = x;
// });

module.exports = router;
