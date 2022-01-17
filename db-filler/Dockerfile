FROM python

ARG DB_HOST
ARG DB_NAME
ARG DB_PORT
ARG DATA_DIR

ENV DB_HOST ${DB_HOST}
ENV DB_NAME ${DB_NAME}
ENV DB_PORT ${DB_PORT}
ENV DATA_DIR ${DATA_DIR}

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY script.py ./

CMD python3 script.py $DB_HOST $DB_NAME $DB_PORT $DATA_DIR
