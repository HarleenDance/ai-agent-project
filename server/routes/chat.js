import express from "express"
import { runAgent } from "../agent/index.js"

const router = express.Router()

/**
 * AI聊天接口
 * POST /chat
 */
router.post("/chat", async (req, res) => {
  try {
    const { userId = "u1", message = "" } = req.body

    // 参数校验
    if (!message) {
      return res.json({
        code: 400,
        message: "message不能为空"
      })
    }

    // 调用Agent核心逻辑
    const result = await runAgent({
      userId,
      message
    })

    // 返回结果
    res.json({
      code: 0,
      data: result
    })
  } catch (error) {
    console.error("chat error:", error)

    res.status(500).json({
      code: 500,
      message: error.message || "服务器错误"
    })
  }
})

export default router