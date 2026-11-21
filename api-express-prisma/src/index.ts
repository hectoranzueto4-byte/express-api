import 'dotenv/config';
import express, { Request, Response } from 'express';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });
const app = express();
const port = process.env.PORT || 3000;

import cors from 'cors';
// ...
app.use(cors()); // Permite peticiones desde cualquier origen en desarrollo
app.use(express.json());

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API de Tareas con Express + Prisma 7 funcionando' });
});

// 1. OBTENER todas las tareas (GET /tasks)
app.get('/tasks', async (_req: Request, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
});

// 2. OBTENER una tarea por ID (GET /tasks/:id)
app.get('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar la tarea' });
  }
});

// 3. CREAR una nueva tarea (POST /tasks)
app.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ error: 'El campo title es obligatorio' });
      return;
    }

    const task = await prisma.task.create({
      data: { title },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// 4. ACTUALIZAR una tarea (PATCH /tasks/:id)
app.patch('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(completed !== undefined && { completed: Boolean(completed) }),
      },
    });

    res.json(task);
  } catch (error) {
    res.status(404).json({ error: 'No se pudo actualizar o la tarea no existe' });
  }
});

// 5. ELIMINAR una tarea (DELETE /tasks/:id)
app.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.task.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'No se pudo eliminar o la tarea no existe' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
