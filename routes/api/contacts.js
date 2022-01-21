const express = require("express");
const router = express.Router();
const { NotFound, BadRequest } = require("http-errors");

const { Contact, joiShema } = require("../../model/contacts");
const { authenticate } = require("../../middlewares");

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, favorite = true } = req.query;
    const skip = (page - 1) * limit;
    const { _id } = req.user;
    const contacts = await Contact.find(
      { owner: _id, favorite },
      "-createdAt -updatedAt",
      { skip, limit: Number(limit) }
    );
    res.json(contacts);
  } catch (e) {
    next(e);
  }
});

router.get("/:contactId", authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw new NotFound();
    }
    res.json(contact);
  } catch (e) {
    if (e.message.includes("Cast to ObjectId failed")) {
      e.status = 404;
    }
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = joiShema.validate(req.body);
    if (error) {
      throw new BadRequest("missing required name field");
    }
    const { _id } = req.user;
    const newContact = await Contact.create({ ...req.body, owner: _id });
    res.status(201).json(newContact);
  } catch (e) {
    if (e.message.includes("validation failad")) {
      e.status = 400;
    }
    next(e);
  }
});

router.delete("/:contactId", authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deleteContact = await Contact.findByIdAndRemove(contactId);
    if (!deleteContact) {
      throw new NotFound();
    }
    res.json("message: contact deleted");
  } catch (e) {
    next(e);
  }
});

router.put("/:contactId", authenticate, async (req, res, next) => {
  try {
    // const { error } = joiShema.validate(req.body);
    // if (error) {
    //   throw new BadRequest("message: missing fields");
    // }
    const { contactId } = req.params;
    const updatrContact = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    res.json(updatrContact);
  } catch (e) {
    if (e.message.includes("validation failad")) {
      e.status = 400;
    }
    next(e);
  }
});

router.patch("/:contactId/favorite", authenticate, async (req, res, next) => {
  try {
    // const { error } = joiShema.validate(req.body);
    // if (error) {
    //   throw new BadRequest("message: missing fields");
    // }
    const { contactId } = req.params;
    const { favorite = false } = req.body;
    const updatrContact = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      {
        new: true,
      }
    );
    res.json(updatrContact);
  } catch (e) {
    if (e.message.includes("validation failad")) {
      e.status = 400;
    }
    next(e);
  }
});

module.exports = router;
