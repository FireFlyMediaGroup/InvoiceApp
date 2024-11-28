'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { POWRAFormData } from './POWRAFormData';

type Part4ReviewProps = {
  formData: POWRAFormData;
  setFormData: React.Dispatch<React.SetStateAction<POWRAFormData>>;
};

export default function Part4Review({
  formData,
  setFormData,
}: Part4ReviewProps) {
  const handleReviewCommentsChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      reviewComments: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-green-500 text-white p-2 rounded">
          Part 4 - REVIEW
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4].map((row) => (
              <TableRow key={row}>
                <TableCell>
                  <Input />
                </TableCell>
                <TableCell>
                  <Input type="date" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Label>Are there any lessons for next time?</Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="lessons-yes" />
                <Label htmlFor="lessons-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="lessons-no" />
                <Label htmlFor="lessons-no">No</Label>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="review-comments">Comments</Label>
            <Textarea
              id="review-comments"
              placeholder="If Yes, comment below and inform your Chief Pilot / HSE Manager."
              value={formData.reviewComments}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleReviewCommentsChange(e.target.value)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
