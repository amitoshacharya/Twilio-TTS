FROM python:3.11

# assign envs
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Create a non-root user
# RUN useradd -m investops_user

# create work directory
WORKDIR  /app/

# Set user
#USER investops_user

# requirement installation
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# copy application
COPY . .



ENTRYPOINT [ "python","main.py", "serve" ]