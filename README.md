
### 0. Base images:
  - Сервис-1: `mongo`.
  - Сервис-2: `python`.
  - Сервис-3: `node`.
  

### 1. Запуск проекта.


1. Копировать абсолютный путь до директории, содержащей нужный `.csv` файл и вставить его в `docker-compose.yml` под опцией `volumes` внутри сервиса-2 `db-filler`.

2. Внутри папки `hw2` запускаем команду:

<pre><code>docker-compose up
</code></pre>

### 2. Запросы.

#### 2.1. Проверка готовности сервера.

- Способ 1: В логах `server-1` при построении compose контейнеров должно быть сообщение:
<pre><code>server_1     | 2021-10-29T11:15:01.065Z server Server ready and listening on 10600
</code></pre>
- Способ 2: В другом терминале (точнее, не в `iteractive mode`), копируем контейнер id образа `hw2_server` (через `docker ps`) и потом запускаем команду 


<pre><code>docker logs &lt;container_id&gt;
</code></pre>

Тогда должно выводиться следующее:

<pre><code>2021-10-29T11:15:01.044Z server Connecting to my_database at port 27017
2021-10-29T11:15:01.062Z server Database my_database connected successfully
2021-10-29T11:15:01.065Z server Server ready and listening on 10600</code></pre>

(порт `10600` - один из выданных мне портов после 2-й лекции).

#### 2.2. Делаем запросы.

Выводим коллекцию из БД в формате json'а:

<pre><code>curl http://localhost:10600 | json_pp
</code></pre>


Проверим, что команда

<pre><code>curl http://localhost:10600/health -i
</code></pre>
возвращает сообщение с кодом `200`

и любая другая команда, например 

<pre><code>curl http://localhost:10600/blabla -i
</code></pre>

дает сообщение с кодом `400`.

### 3. Критерии.

#### 3.1. Данные заполняются сразу при старте БД, без участия сервиса-2.

Заполнение БД делается в файле `script.py`, запущен вторым сервисом. Там сначала загружается `.csv` файл с помощью `pandas`, а дальше создается соответсвующая коллекция в mongo БД `my_database` по стандартному порту `27017` (можно и несколько  `.csv` файлов. В том случае, для каждого файла создается своя коллекция). 

#### 3.2. Проверка заполнения данных. Например, простой SELECT к базе и вывод в stdout лога о том, что данные заполнены.

Это тоже делается в `script.py`, сразу после заполнения БД. Логы `db-filler_1` выводят post'ы, добавленные в БД и проверяется, что `number_of_post_in_mongo_collection == number_of_rows_in_.csv_file`.

Пример логов для `grades.csv` в папке `/hw2/csv-files`:

<pre><code>
db-filler_1  | Checking insertion of "grades" collection into the database...
db-filler_1  | {'_id': ObjectId('617bd7b25574ced6be29cb8a'), 'Sir Cumference': 10}
db-filler_1  | {'_id': ObjectId('617bd7b25574ced6be29cb8b'), 'Phillip Anthropy': 8}
db-filler_1  | {'_id': ObjectId('617bd7b25574ced6be29cb8c'), 'Benjamin Evalent': 4}
db-filler_1  | {'_id': ObjectId('617bd7b25574ced6be29cb8d'), 'Sue Shei': 3}
db-filler_1  | {'_id': ObjectId('617bd7b25574ced6be29cb8e'), 'Burgundy Flemming': 6}
db-filler_1  | {'_id': ObjectId('617bd7b25574ced6be29cb8f'), 'Gunther Beard': 5}
db-filler_1  | {'_id': ObjectId('617bd7b25574ced6be29cb90'), 'Justin Case': 7}
db-filler_1  | {'_id': ObjectId('617bd7b25574ced6be29cb91'), 'Ursula Gurnmeister': 5}
db-filler_1  | Checking that all rows in "grades" where inserted into the database...
db-filler_1  | Check passed. Data in grades.csv successfully inserted into Mongo database
</code></pre>


#### 3.3. Монтирование файла с данными в качестве VOLUME, а не просто добавление файла в контейнер через ADD

Сделано в `docker-compose.yml` в объявлении сервиса 2:
<pre><code>volumes:
      - /home/tpos2021/tpo2021101/hw2/csv-files:/my-data
</code></pre>

#### 3.4. Контейнер не удаляется после того, как отработал

Со следуйщей командой можно это проверить, что контейнер образа `hw2_db-filler` убивался после выполнения

<pre><code>docker container ls -f status=exited -a
</code></pre>