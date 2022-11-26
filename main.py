import os
from os import system, name
from time import sleep
 

PATH = os.path.realpath(os.path.dirname(__file__))
DELAY = 5
matrix = []


def clear():
    # For windows
    if name == 'nt':
        _ = system('cls')
    # for mac and linux(here, os.name is 'posix')
    else:
        _ = system('clear')


def print_matrix():
    global matrix
    string=""
    for row_idx, row in enumerate(matrix):
        for column_idx, value in enumerate(row):
            string += value + " "
        string+="\n"
    print(string)


def select_file():
    options = []
    for filename in os.listdir(PATH):
        if os.path.isfile(os.path.join(PATH, filename)) and filename.endswith('.txt'):
            options.append(filename)
    print("Please select the file where the matrix is located")
    for idx, option in enumerate(options):
        print("%d) %s" % (idx+1, option))
    try:
        answer = int(input(": "))
        return options[answer-1]
    except:
        print("Insert a valid option")
        return select_file()


def load_matrix():
    global matrix
    filename = select_file()
    with open(filename) as f:
        for line in f:
            line = line.strip()
            matrix.append(line.split(","))
    try:
        for row in matrix:
            for value in row:
                if(value not in ("0","1")):
                    print(value)
                    print("File is not valid")
                    matrix = []
                    return load_matrix()
    except:
        print("File is not valid")
        matrix = []
        return load_matrix()     


def get_next_prospect():
    global matrix
    max_off_neighbours = -1
    next_prospect = (None, None)
    for row_idx, row in enumerate(matrix):
        for column_idx, value in enumerate(row):
            current_off_neighbours = 0
            if(value=="0"):
                #Check left
                i = column_idx - 1
                while(i>=0 and row[i] != "1"):
                    if(row[i]=="0"):
                        current_off_neighbours += 1
                    i-=1
                #Check right
                i = column_idx + 1
                while(i<len(row) and row[i] != "1"):
                    if(row[i]=="0"):
                        current_off_neighbours += 1
                    i+=1
                #Check up
                i = row_idx - 1
                while(i>=0 and matrix[i][column_idx] != "1"):
                    if(matrix[i][column_idx]=="0"):
                        current_off_neighbours += 1
                    i-=1
                #Check down
                i = row_idx + 1
                while(i<len(matrix) and matrix[i][column_idx] != "1"):
                    if(matrix[i][column_idx] == "0"):
                        current_off_neighbours += 1
                    i += 1

                if(current_off_neighbours > max_off_neighbours):
                    max_off_neighbours = current_off_neighbours
                    next_prospect = (row_idx, column_idx)
    return next_prospect


def turn_on(row_idx:int, column_idx:int):
    global matrix
    matrix[row_idx][column_idx] = "*"
    # Go left
    i = column_idx - 1
    while(i>=0 and matrix[row_idx][i] != "1"):
        matrix[row_idx][i] = "+"
        i-=1
    # Go right
    i = column_idx + 1
    while(i<len(matrix[row_idx]) and matrix[row_idx][i] != "1"):
        matrix[row_idx][i] = "+"
        i+=1
    # Go up
    i = row_idx - 1
    while(i>=0 and matrix[i][column_idx] != "1"):
        matrix[i][column_idx] = "+"
        i-=1
    # Go down
    i = row_idx + 1
    while(i<len(matrix) and matrix[i][column_idx] != "1"):
        matrix[i][column_idx] = "+"
        i += 1
                


def main():
    global matrix
    load_matrix()
    print("Initial matrix")
    print_matrix()

    on_lights = 0
    row_idx, column_idx = get_next_prospect()

    while(row_idx != None):
        sleep(DELAY)
        clear()
        print("%d lights up until now" % (on_lights))
        print("Turning on %d,%d light" % (row_idx, column_idx))
        turn_on(row_idx, column_idx)
        print_matrix()
        row_idx, column_idx = get_next_prospect()
        on_lights += 1

    print("All cells lit up. %d light bulbs on" % (on_lights))


if __name__ == "__main__":
    main()
