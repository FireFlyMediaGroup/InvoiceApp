import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RiskMatrixData } from "@/types/risk-matrix";

interface RiskMatrixDisplayProps {
  data: RiskMatrixData;
}

export function RiskMatrixDisplay({ data }: RiskMatrixDisplayProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Risk Matrix Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Title:</span> {data.title}
            </div>
            <div>
              <span className="font-medium">Site:</span> {data.site}
            </div>
            <div>
              <span className="font-medium">Description:</span> {data.description}
            </div>
            <div>
              <span className="font-medium">Assessment Date:</span> {data.assessmentDate}
            </div>
            <div>
              <span className="font-medium">Total Score:</span> {data.analysis.totalScore}
            </div>
          </div>
        </CardContent>
      </Card>

      {data.sections.map((section) => (
        <Card key={section.name}>
          <CardHeader>
            <CardTitle>{section.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.questions.map((question) => (
                  <TableRow key={question.question}>
                    <TableCell>{question.question}</TableCell>
                    <TableCell>{question.answer}</TableCell>
                    <TableCell>
                      <Badge>{question.score}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
