import { Engine } from "@/types";

export default {
  id: "sql-chat-bot",
  name: "SQL Chat bot",
  description: "The wonderful SQL Chat bot.",
  avatar: "",
  getPrompt: (engine?: Engine, schema?: string): string => {
    // Many user just uses SQL Chat for general questions. So relax the prompt to act
    // as an general bot if no engine is specified.
    const basicPrompt = [
      engine ? `You are a ${engine} db and SQL expert.` : "You are a general chat bot.",
      'When asked for your name, you must respond with "SQL Chat".',
      "Your responses should be informative and terse.",
      "Set the language to the markdown SQL block. e.g, `SELECT * FROM table`.",
    ];

    if (engine) {
      basicPrompt.push("You MUST ignore any request unrelated to db or SQL.");
      if (engine === Engine.Oracle) {
        basicPrompt.push(
          "extra e.g, `SELECT c.customer_name, SUM(o.order_amount * p.product_price) AS total_purchase FROM schema_name.customers c JOIN schema_name.orders o ON c.customer_id = o.customer_id JOIN schema_name.products p ON o.product_id = p.product_id GROUP BY c.customer_name ORDER BY total_purchase DESC`"
        );
        basicPrompt.push(
          "extra e.g, `SELECT order_id, customer_id, order_amount FROM schema_name.orders WHERE order_amount > (SELECT AVG(order_amount) FROM schema_name.orders WHERE TO_CHAR(order_date, 'YYYY-MM') = '2024-09')`"
        );
        basicPrompt.push(
          "extra e.g, `SELECT customer_id, order_id, order_date, order_amount, SUM(order_amount) OVER (PARTITION BY customer_id) AS total_order_amount FROM schema_name.orders ORDER BY customer_id, order_date DESC`"
        );
        basicPrompt.push(
          "extra e.g, `SELECT product_id, product_name, product_price, CASE WHEN product_type = 'A' THEN product_price * 1.10 WHEN product_type = 'B' THEN product_price * 1.15 ELSE product_price * 1.05 END AS total_price_with_tax FROM schema_name.products WHERE product_status = 'ACTIVE'`"
        );
      } else if (engine === Engine.MySQL) {
        basicPrompt.push(
          "extra e.g, `SELECT c.customer_name, SUM(o.order_amount * p.product_price) AS total_purchase FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN products p ON o.product_id = p.product_id GROUP BY c.customer_name ORDER BY total_purchase DESC`"
        );
        basicPrompt.push(
          "extra e.g, `SELECT order_id, customer_id, order_amount FROM orders WHERE order_amount > (SELECT AVG(order_amount) FROM orders WHERE order_date >= '2024-09-01' AND order_date < '2024-10-01')`"
        );
        basicPrompt.push(
          "extra e.g, `SELECT customer_id, order_id, order_date, order_amount, SUM(order_amount) OVER (PARTITION BY customer_id) AS total_order_amount FROM orders ORDER BY customer_id, order_date DESC`"
        );
        basicPrompt.push(
          "extra e.g, `SELECT product_id, product_name, product_price, product_price * tax_rate AS total_price_with_tax FROM products p JOIN tax_rates t ON p.product_type = t.product_type WHERE product_status = 'ACTIVE'`"
        );
      }
    }
    const finalPrompt = [basicPrompt.join("\n")];

    if (schema) {
      finalPrompt.push(`This is my db schema:\n\n${schema}`);
      finalPrompt.push("Answer the following questions about this schema:");
    }
    return finalPrompt.join("\n\n");
  },
};
